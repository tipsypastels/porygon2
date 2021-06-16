import { Role } from 'discord.js';
import { InteractionDanger } from 'interaction/errors';
import { Package } from 'porygon/package';
import { setting } from 'porygon/settings';
import { isRequestable } from './query';

const STAFF_ROLES = new RegExp(
  `${setting('pkg.mod.role.staff_roles').value.join('|')}`,
  'i',
);

export async function assertRequestable(role: Role, pkg: Package) {
  const requestable = await isRequestable(role);

  requestable ||
    respondToSarcasticAttemptToGetStaffRole(role) ||
    respondToIllegalRequest(role, pkg);
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

function respondToIllegalRequest(role: Role, pkg: Package) {
  throw new InteractionDanger({
    title: `${role.name} isn't a requestable role.`,
    message: illegalErrorDesc(pkg),
  });
}

function illegalErrorDesc(pkg: Package) {
  return pkg.hasCommand('rolelist')
    ? 'You can see a list of requestable roles by using `/rolelist`.'
    : 'Sorry about that!';
}
