import { Role } from 'discord.js';
import { database } from 'porygon/database';
import { Diff } from 'porygon/diff';
import { Embed } from 'porygon/embed';
import { RoleModOpts } from './types';
import { fetchRoleOpts } from './shared';
import { embeddedError } from 'porygon/embed/errors';

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
    throw embeddedError((e) => {
      e.setTitle('You used /rolemod set with no parameters.').setDescription(
        'Nothing to set!',
      );
    });
  }

  if (diff.allChangesWereNoOps) {
    throw embeddedError((e) => {
      e.setTitle(
        'All the values you provided were the same as the existing values.',
      ).setDescription('Are you trying to confuse me?');
    });
  }
}
