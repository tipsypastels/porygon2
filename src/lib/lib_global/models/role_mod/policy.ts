import { Role } from 'discord.js';
import { InteractionDanger } from 'interaction/errors';
import { Lib } from 'lib/lib';
import { setting } from 'porygon/settings';
import { isRequestable } from './query';

const STAFF_ROLES = new RegExp(
  `${setting<string[]>('lib.global.role.staff_roles').value.join('|')}`,
  'i',
);

export async function assertRequestable(role: Role, lib: Lib) {
  const requestable = await isRequestable(role);

  requestable ||
    respondToSarcasticAttemptToGetStaffRole(role) ||
    respondToIllegalRequest(role, lib);
}

function respondToSarcasticAttemptToGetStaffRole(role: Role) {
  if (role.name.match(STAFF_ROLES)) {
    throw new InteractionDanger({
      title: 'Nice try.',
      message: `Requesting ${role.name}? Porygon has never seen that one before.`,
      yieldEmbed: (e) => e.poryThumb('angry'),
    });
  }
}

function respondToIllegalRequest(role: Role, lib: Lib) {
  throw new InteractionDanger({
    title: `${role.name} isn't a requestable role.`,
    message: illegalErrorDesc(lib),
  });
}

function illegalErrorDesc(lib: Lib) {
  return lib.hasCommand('rolelist')
    ? 'You can see a list of requestable roles by using `/rolelist`.'
    : 'Sorry about that!';
}
