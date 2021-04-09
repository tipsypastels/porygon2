import { Intents } from 'discord.js';

export const intents = new Intents();

intents.add(
  'GUILDS',
  'GUILD_BANS',
  'GUILD_EMOJIS',
  'GUILD_MEMBERS',
  'GUILD_MESSAGES',
  'GUILD_PRESENCES',
);
