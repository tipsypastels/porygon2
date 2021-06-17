import { Guild } from 'discord.js';
import { database } from 'porygon/database';
import { Embed } from 'porygon/embed';
import { RoleModOpts } from './types';
import { embedRoleFields } from './shared';

export async function createRoleMod(guild: Guild, opts: Partial<RoleModOpts>) {
  const { name, hoist, mentionable, requestable, bound } = opts;

  const role = await guild.roles.create({ name, hoist, mentionable });
  const behaviors = await database.roleBehaviors.create({
    data: { roleId: role.id, requestable, bound },
  });

  return (embed: Embed) => {
    embed.setTitle(`Role "${role.name}" created!`);
    embedRoleFields(embed, role, behaviors);
  };
}
