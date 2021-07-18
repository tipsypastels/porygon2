import { Role } from 'discord.js';
import { embeddedError } from 'porygon/embed/errors';
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
    throw embeddedError((e) => {
      e.poryThumb('angry')
        .setTitle('Nice try.')
        .setDescription(
          `Requesting ${role.name}? Porygon has never seen that one before.`,
        );
    });
  }
}

function respondToIllegalRequest(role: Role, pkg: Package) {
  throw embeddedError((e) => {
    e.setTitle(`${role.name} isn't a requestable role.`).setDescription(
      illegalErrorDesc(pkg),
    );
  });
}

function illegalErrorDesc(pkg: Package) {
  return pkg.hasCommand('rolelist')
    ? 'You can see a list of requestable roles by using `/rolelist`.'
    : 'Sorry about that!';
}
