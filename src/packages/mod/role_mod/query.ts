import { Role } from 'discord.js';
import { database } from 'porygon/database';

export async function isRequestable(role: Role) {
  const entry = await find(role);
  return entry?.requestable === true;
}

function find(role: Role) {
  return database.roleBehaviors.findFirst({ where: { roleId: role.id } });
}
