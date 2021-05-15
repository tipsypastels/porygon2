import { GuildMember, Role } from 'discord.js';
import { database } from 'porygon/database';
import { CollectionCache } from 'support/cache';

const IS_BOUND_CACHE = new CollectionCache<string, boolean>();

export async function tryBindRoleToMember(member: GuildMember, role: Role) {
  if (!(await shouldBind(role))) {
    return;
  }

  await database.boundRole.create({
    data: { roleId: role.id, userId: member.id },
  });
}

async function shouldBind(role: Role) {
  return IS_BOUND_CACHE.findOrAsync(role.id, async () => {
    const behavior = await database.roleBehaviors.findFirst({
      where: { roleId: role.id },
    });

    return behavior?.bound ?? false;
  });
}
