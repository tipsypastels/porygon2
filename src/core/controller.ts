import { try_get_guild, get_guild_id, GuildNickname } from './guild';
import { Data } from './command';
import { ApplicationCommand, Client, Collection, Guild } from 'discord.js';
import { IS_STAGING } from 'support/env';
import { Maybe, NONE } from 'support/null';
import { panic_assert, panic_take } from './assert';

type UploadOutcome = Maybe<Promise<Collection<string, ApplicationCommand>>>;

/**
 * A part of Porygon's setup process. Controllers are unique objects that specify
 * targets to upload and setup against. For example, each Porygon guild has a
 * corresponding `Controller` instance, and one passes that instance into the
 * `add_chat_command` (or equivalent) function to define a command that exists
 * in that controller's guild.
 *
 * Controllers work closely with registrars, which are more general classes that
 * actually perform the setup and storage. There are several types of registrars,
 * such as for commands, but most defer to their controller to fill in behaviour
 * like determining the target for uploads.
 */
export interface Controller {
  /**
   * Name of the controller, for logging purposes.
   */
  name: string;

  /**
   * File-name of the controller, for controller-indexed caches
   * like the /pory command.
   */
  file_name: string;

  /**
   * Returns whether Porygon is connected to this controller's guild, if the controller
   * describes a guild, or `true` if the controller is `GLOBAL`. Because `GLOBAL`
   * exists, checking that `try_into_guild` succeeds is not sufficient to decide
   * if a controller is connected.
   *
   * Used by tasks and initializers to decide if they should run their hooks.
   */
  is_connected(client: Client): boolean;

  /**
   * Tests whether a hypothetical guild ID (or not!) matches a controller.
   * This is used by the initializer `EventProxy` to decide whether to delegate
   * events to an event handler added by a specific guild.
   */
  matches_guild(guild_id: Maybe<string>): boolean;

  /**
   * Tries to look up a guild for this controller. This may be absent for several reasons:
   *   - We are in staging and there is no such guild.
   *   - We are in production but Porygon is not on that guild.
   *   - Calling the method on `GLOBAL`.
   */
  try_into_guild(client: Client): Maybe<Guild>;

  /**
   * Uploads commands to the endpoint described by the controller. Used by the
   * command registrar, obviously. This is fallible for the same reasons `try_into_guild`
   * is fallible.
   */
  upload_commands(data: Data[], client: Client): UploadOutcome;
}

export const GLOBAL: Controller = {
  name: 'global',
  file_name: 'global',

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
    const app = panic_take(client.application, 'Client was offline during setup!');
    return app.commands.set(data);
  },
};

export const STAGING_OVERRIDE = make_guild_controller('staging');
export const POKECOM = make_guild_controller('pc');
export const POKECOM_STAFF = make_guild_controller('pc_staff');
export const DUCK = make_guild_controller('duck');

function make_guild_controller(nick: GuildNickname): Controller {
  const guild_id = get_guild_id(nick);
  return {
    name: `guild(${nick})`,
    file_name: `guild_${nick}`,

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
      const guild = try_get_guild(nick, client);
      panic_assert(guild, `BUG: Guild ${this.name} is connected but absent!`);

      return guild.commands.set(data);
    },
  };
}

export function proper_controller_for_env(prod: Controller) {
  return IS_STAGING ? STAGING_OVERRIDE : prod;
}
