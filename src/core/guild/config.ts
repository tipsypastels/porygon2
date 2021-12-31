import { Client } from 'discord.js';

/**
 * Preset names for specific guilds. Since Porygon is not a general
 * purpose bot and is built with individual guilds in mind, we can
 * have this nice syntax for referring to them rather than IDs.
 */
export type GuildNickname = 'pc' | 'pc_staff' | 'duck' | 'staging';

export interface GuildConfig {
  id: string;
}

const CONFIG: Record<GuildNickname, GuildConfig> = {
  pc: { id: '157983957902819328' },
  pc_staff: { id: '193103073210662914' },
  duck: { id: '322199235825238017' },
  staging: { id: '910079990123601931' },
};

/**
 * Converts a guild "nickname" into its actual guild ID.
 */
export function get_guild_id(nick: GuildNickname) {
  return CONFIG[nick].id;
}

/**
 * Tries to convert a guild nickname into an actual guild object, using the
 * client's cache. This is fallible, since even in production guilds being
 * missing is not meant to be a program-ending state (for Porygon Beta, etc)
 */
export function try_get_guild(nick: GuildNickname, client: Client) {
  return client.guilds.cache.get(get_guild_id(nick));
}
