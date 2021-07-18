import { GuildMember, Role } from 'discord.js';
import { database } from 'porygon/database';
import { createLang } from 'porygon/lang';
import { logger } from 'porygon/logger';
import { AsyncCache } from 'support/cache';

const TABLE = database.boundRole;
const BEHAVIOR_TABLE = database.roleBehaviors;

const CACHE = new AsyncCache(async (roleId: string) => {
  const behavior = await BEHAVIOR_TABLE.findFirst({ where: { roleId } });
  return behavior?.bound ?? false;
});

export function isBoundRole(role: Role) {
  return CACHE.get(role.id);
}

export function addBoundRole(member: GuildMember, role: Role) {
  const primaryKey = { roleId: role.id, userId: member.id };

  return TABLE.upsert({
    where: { userId_roleId: primaryKey },
    create: primaryKey,
    update: {}, // ignore updates, all data is part of pkey
  });
}

export async function tryAddBoundRole(member: GuildMember, role: Role) {
  if (await isBoundRole(role)) return await addBoundRole(member, role);
}

export function removeBoundRole(member: GuildMember, role: Role) {
  return TABLE.delete({
    where: { userId_roleId: { userId: member.id, roleId: role.id } },
  });
}

export async function tryRemoveBoundRole(member: GuildMember, role: Role) {
  if (await isBoundRole(role)) return await removeBoundRole(member, role);
}

export async function regainBoundRoles(member: GuildMember) {
  const { guild } = member;
  const entries = await TABLE.findMany({ where: { userId: member.id } });

  if (entries.length === 0) {
    return;
  }

  const missingRoles: string[] = [];
  const promises = entries.map(async (entry) => {
    const role = await guild.roles.fetch(entry.roleId);

    if (!role) {
      missingRoles.push(entry.roleId);
      return;
    }

    await member.roles.add(role);
  });

  await Promise.all(promises);

  if (missingRoles.length) {
    logMissingBoundRoles(missingRoles);
  }
}

function logMissingBoundRoles(missing: string[]) {
  logger.warn(missingLang('missing', { list: missing.join(','), count: missing.length }));

  TABLE.deleteMany({ where: { roleId: { in: missing } } });
  missing.forEach((r) => CACHE.uncache(r));
}

const missingLang = createLang(<const>{
  missing: {
    1: 'Missing bound role {list} is being deleted.',
    _: 'Missing bound roles {list} are being deleted.',
  },
});
