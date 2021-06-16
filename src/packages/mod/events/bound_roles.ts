import { GuildMember, PartialGuildMember, Collection, Role } from 'discord.js';
import { EventHandler } from 'porygon/package';
import {
  regainBoundRoles,
  tryAddBoundRole,
  tryRemoveBoundRole,
} from '../bound_role';

const boundRoleHandler: EventHandler = ({ events }) => {
  events.on('guildMemberUpdate', onUpdate).on('guildMemberAdd', onJoin);
};

export default boundRoleHandler;

type Roles = Collection<string, Role>;
type RolesTuple = [Roles, Roles];

function onUpdate(from: GuildMember | PartialGuildMember, to: GuildMember) {
  const [added, removed] = findRoleChanges(from.roles.cache, to.roles.cache);

  const addedPromises = added.map((role) => tryAddBoundRole(to, role));
  const removedPromises = removed.map((role) => tryRemoveBoundRole(to, role));

  return Promise.all(addedPromises.concat(removedPromises));
}

function onJoin(member: GuildMember) {
  regainBoundRoles(member);
}

// NOTE: typecast needed bc this technically returns a BaseCollection
function findRoleChanges(from: Roles, to: Roles) {
  return from.difference(to).partition((role) => to.has(role.id)) as RolesTuple;
}
