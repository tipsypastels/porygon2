import { Role } from 'discord.js';
import { database } from 'porygon/database';
import { Diff } from 'porygon/diff';
import { Embed } from 'porygon/embed';
import { RoleModOpts } from './types';
import { fetchRoleOpts } from './shared';
import { InteractionWarning } from 'interaction/errors';

export async function updateRoleMod(role: Role, opts: Partial<RoleModOpts>) {
  const currentOpts = await fetchRoleOpts(role);
  const { name, hoist, mentionable, requestable, bound } = opts;
  const diff = Diff.of(currentOpts, opts);

  assertChanged(diff);

  await Promise.all([
    role.edit({ name, hoist, mentionable }),
    database.roleBehaviors.upsert({
      where: { roleId: role.id },
      update: { requestable, bound },
      create: { requestable, bound, roleId: role.id },
    }),
  ]);

  return (embed: Embed) => {
    embed
      .addField('Name', diff.getChangeString('name'))
      .addField('Hoist', diff.getChangeString('hoist'))
      .addField('Bound', diff.getChangeString('bound'))
      .addField('Requestable', diff.getChangeString('requestable'))
      .addField('Mentionable', diff.getChangeString('mentionable'));
  };
}

function assertChanged(diff: Diff<RoleModOpts>) {
  if (diff.unchanged) {
    throw new InteractionWarning(
      'You used /rolemod set with no parameters.',
      'Nothing to set!',
    );
  }

  if (diff.allChangesWereNoOps) {
    throw new InteractionWarning(
      'All the values you provided were the same as the existing values.',
      'Are you trying to confuse me?',
    );
  }
}
