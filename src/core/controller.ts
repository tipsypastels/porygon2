import { get_guild, get_guild_id, GuildNickname } from './guild';
import { Data } from './command';
import { ApplicationCommand, Client, Collection, Guild } from 'discord.js';
import { panic } from './logger';
import { IS_STAGING } from 'support/env';
import { Maybe, NONE } from 'support/type';

type UploadOutcome = Promise<Collection<string, ApplicationCommand>>;

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
  tag: string;
  matches_guild(guild_id: Maybe<string>): boolean;
  try_into_guild(client: Client): Maybe<Guild>;
  upload_commands(data: Data[], client: Client): UploadOutcome;
}

export const GLOBAL: Controller = {
  tag: 'global',

  matches_guild() {
    return true;
  },

  try_into_guild() {
    return NONE;
  },

  upload_commands(data, client) {
    const app = client.application ?? panic('Client was offline during setup.');
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
    tag: `guild_${nick}`,

    matches_guild(id) {
      return id === guild_id;
    },

    try_into_guild(client: Client) {
      return get_guild(nick, client);
    },

    upload_commands(data, client) {
      const guild = get_guild(nick, client);
      return guild.commands.set(data);
    },
  };
}

export function proper_controller_for_env(prod: Controller) {
  return IS_STAGING ? STAGING_OVERRIDE : prod;
}
