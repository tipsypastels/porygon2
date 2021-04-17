import { Role } from 'discord.js';
import { InteractionDanger } from 'interaction/errors';
import { Lib } from 'lib/lib';
import { database } from 'porygon/database';

const IRATE_ROLE_NAMES = /owner|admin|moderator|moderoid/i;

export async function assertRequestable(role: Role, lib: Lib) {
  const requestable = await isRequestable(role);
  if (requestable) return;

  if (shouldUseIrateResponse(role)) {
    throw new InteractionDanger({
      title: 'Nice try.',
      message: `Requesting ${role.name}? Porygon has never seen that one before.`,
      yieldEmbed: (e) => e.poryThumb('angry'),
    });
  }

  const errorDesc = shouldReferUserToRoleList(lib)
    ? 'You can see a list of requestable roles by using `/rolelist`.'
    : 'Sorry about that!';

  throw new InteractionDanger(
    `${role.name} isn't a requestable role.`,
    errorDesc,
  );
}

function shouldUseIrateResponse(role: Role) {
  return IRATE_ROLE_NAMES.exec(role.name);
}

function shouldReferUserToRoleList(lib: Lib) {
  return lib.hasCommand('rolelist');
}

export async function isRequestable(role: Role) {
  const entry = await find(role);
  return entry?.requestable === true;
}

function find(role: Role) {
  return database.roleBehaviors.findFirst({ where: { roleId: role.id } });
}
