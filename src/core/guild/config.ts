import { panic } from 'core/logger';
import { Client } from 'discord.js';

export type GuildNickname = 'pc' | 'pc_staff' | 'duck' | 'dev';

export interface GuildConfig {
  id: string;
}

const CONFIG: Record<GuildNickname, GuildConfig> = {
  pc: { id: '157983957902819328' },
  pc_staff: { id: '193103073210662914' },
  duck: { id: '322199235825238017' },
  dev: { id: '910079990123601931' },
};

export function get_guild_id(nick: GuildNickname) {
  return CONFIG[nick].id;
}

// NOTE: normally we wouldn't panic in a non-setup library function, but
// this should never happen as all guild nicknames are only for known guilds
// set in advance.
export function get_guild(nick: GuildNickname, client: Client) {
  const guild = client.guilds.cache.get(get_guild_id(nick));
  return guild ?? panic(`Unknown guild nickname "${nick}".`);
}
