import { Role } from 'discord.js';
import { Embed } from 'porygon/embed';
import { fetchRoleOpts, embedRoleFields } from './shared';

export async function fetchRoleMod(role: Role) {
  const { name, hoist, mentionable, requestable, bound } = await fetchRoleOpts(
    role,
  );

  return (embed: Embed) => {
    embedRoleFields(
      embed,
      { name, hoist, mentionable },
      { requestable, bound },
    );
  };
}
