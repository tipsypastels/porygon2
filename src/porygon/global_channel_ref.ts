import { Guild, GuildChannel, TextChannel } from 'discord.js';
import { isIntLike } from 'support/number';
import { Porygon } from './client';
import { setting } from './settings';

const GUILD_NAMES = setting('guilds');

interface Opts {
  code: string;
  client: Porygon;
  currentGuild: Guild;
}

/**
 * Allows referencing a channel on *any* server uniquely.
 * Because the `CHANNEL` command option will only let you
 * pick from the current server, we instead use a special
 * string syntax. Examples of what is valid:
 *
 * Bare channel ID - refers to current guild
 *
 *    746219046374080535
 *
 * Bare channel name - likewise
 *
 *    general
 *
 * Qualified channel name (name is looked up in settings)
 *
 *    pokecom:general
 *
 * And any combination thereof.
 */
export function globallyLocateChannel({ code, client, currentGuild }: Opts) {
  const segments = code.split(':');

  if (segments.length === 1) {
    return locateChannel(segments[0], currentGuild);
  }

  const guild = locateGuild(segments[0], client);
  return locateChannel(segments[1], guild);
}

function locateGuild(code: string, client: Porygon) {
  return locate(code, {
    byId(id) {
      return client.guilds.cache.get(id);
    },
    byName(name) {
      const id = GUILD_NAMES.value[name as keyof typeof GUILD_NAMES['value']];
      return client.guilds.cache.get(id);
    },
    assertValid() {
      // all guilds are valid
    },
    toErrorMessage(searchType) {
      return `No guild with ${searchType}: ${code}`;
    },
  });
}

function locateChannel(code: string, guild: Guild) {
  return locate(code, {
    byId(id) {
      return guild.channels.cache.get(id);
    },
    byName(name) {
      return guild.channels.cache.find((ch) => ch.name === name);
    },
    assertValid(channel: GuildChannel): asserts channel is TextChannel {
      if (!(channel instanceof TextChannel)) {
        throw new Error(`${channel.name} is not a text channel`);
      }
    },
    toErrorMessage(searchType) {
      return `No channel with ${searchType}: ${code} on ${guild.name}`;
    },
  });
}

interface Locate<T, R extends T = T> {
  byId(id: string): T | undefined;
  byName(name: string): T | undefined;
  assertValid(value: T): asserts value is R;
  toErrorMessage(searchType: string): string;
}

function locate<T, R extends T>(code: string, opts: Locate<T, R>): R {
  const isId = isIntLike(code);
  const value = isId ? opts.byId(code) : opts.byName(code);

  if (!value) {
    const searchType = isId ? 'ID' : 'name';
    throw new Error(opts.toErrorMessage(searchType));
  }

  opts.assertValid(value);

  return value;
}
