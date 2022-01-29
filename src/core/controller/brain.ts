import { panic_take } from 'core/assert';
import { get_guild_id, GuildNickname, try_get_guild } from 'core/guild';
import { ApplicationCommand, Client, Collection, Guild } from 'discord.js';
import { IS_STAGING, staging } from 'support/env';
import { Maybe, NONE } from 'support/null';
import { Data } from '../command';

export type UploadOutcome = Maybe<Promise<Collection<string, ApplicationCommand>>>;

/**
 * The inner behaviour of a `Controller`.
 *
 * Why is this its own type? Staging purposes. Controller brains are overridden
 * to always point to `STAGING` in staging, while controllers themselves
 * always point to their production guild. This allows the *behaviour* of
 * controllers to be overridden in staging, while keeping their identity stable
 * between staging and production.
 */
export interface ControllerBrain {
  /**
   * Returns whether Porygon is connected to this controller's guild, if the controller
   * describes a guild, or `true` if the controller is `GLOBAL_BRAIN`. Because
   * `GLOBAL_BRAIN` exists, checking that `try_into_guild` succeeds is not
   * sufficient to decide if a controller is connected.
   *
   * Used by tasks and initializers to decide if they should run their hooks.
   */
  is_connected(client: Client): boolean;

  /**
   * Tests whether a hypothetical guild ID (or not!) matches a controller brain.
   * This is used by the initializer `EventProxy` to decide whether to delegate
   * events to an event handler added by a specific guild.
   */
  matches_guild(guild_id: Maybe<string>): boolean;

  /**
   * Tries to look up a guild for this brain. This may be absent for several reasons:
   *   - We are in staging and there is no such guild.
   *   - We are in production but Porygon is not on that guild.
   *   - Calling the method on `GLOBAL_BRAIN`.
   */
  try_into_guild(client: Client): Maybe<Guild>;

  /**
   * Uploads commands to the endpoint described by the controller. Used by the
   * command registrar, obviously. This is fallible for the same reasons `try_into_guild`
   * is fallible.
   */
  upload_commands(data: Data[], client: Client): UploadOutcome;
}

const STAGING: ControllerBrain = {
  is_connected() {
    return IS_STAGING;
  },

  matches_guild() {
    return IS_STAGING;
  },

  try_into_guild(client: Client) {
    return try_get_guild('staging', client);
  },

  upload_commands(data, client) {
    const guild = panic_take(this.try_into_guild(client), 'Staging ghosted!');
    return do_upload_guild(data, guild);
  },
};

const global: ControllerBrain = staging(STAGING, {
  is_connected() {
    return true;
  },

  matches_guild() {
    return true;
  },

  try_into_guild() {
    return NONE;
  },

  upload_commands(data, client) {
    return do_upload_global(data, client);
  },
});

const pc = make_guild_brain('pc');
const pc_staff = make_guild_brain('pc_staff');
const duck = make_guild_brain('duck');

export const BRAINS = { global, pc, pc_staff, duck };

function make_guild_brain(nick: Exclude<GuildNickname, 'staging'>): ControllerBrain {
  if (IS_STAGING) {
    return STAGING;
  }

  const guild_id = get_guild_id(nick);
  return {
    is_connected(client) {
      return !!this.try_into_guild(client);
    },

    matches_guild(id) {
      return id === guild_id;
    },

    try_into_guild(client: Client) {
      return try_get_guild(nick, client);
    },

    upload_commands(data, client) {
      const guild = panic_take(this.try_into_guild(client), `Guild %${nick}% ghosted!`);
      return do_upload_guild(data, guild);
    },
  };
}

function do_upload_global(data: Data[], client: Client) {
  const app = panic_take(client.application, 'Client was offline during setup!');
  return app.commands.set(data);
}

function do_upload_guild(data: Data[], guild: Guild) {
  return guild.commands.set(data);
}
