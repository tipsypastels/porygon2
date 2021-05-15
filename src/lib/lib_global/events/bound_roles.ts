import { GuildHandler } from 'lib/lib/event';

// TODO: revisit this when @discordjs/collection is consistently used

const boundRoleHandler: GuildHandler = ({ em }) => {
  // em.on('guildMemberUpdate', onUpdate);
};

export default boundRoleHandler;

// function onUpdate(from: GuildMember | PartialGuildMember, to: GuildMember) {
//   const [added, removed] = findRoleChanges(from.roles.cache, to.roles.cache);

//   Promise.all([eachAddedRole(added, to)]);
// }

// function findRoleChanges(
//   from: Collection<string, Role>,
//   to: Collection<string, Role>,
// ) {
//   return from.difference(to).partition((role) => to.has(role.id));
// }

// async function eachAddedRole(
//   added: Collection<string, Role>,
//   member: GuildMember,
// ) {
//   if (added.size === 0) {
//     return;
//   }

//   const promises = added.map((role) => {
//     return tryBindRoleToMember(member, role);
//   });

//   await Promise.all(promises);
// }
