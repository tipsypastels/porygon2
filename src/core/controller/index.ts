import { Data } from 'core/command';
import { GuildNickname } from 'core/guild';
import { Client } from 'discord.js';
import { IS_STAGING } from 'support/env';
import { Maybe } from 'support/null';
import { BRAINS, ControllerBrain } from './brain';

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
 *
 * The actual *behaviour* of a controller is defined by `ControllerBrain`. This allows
 * controllers to *not* be special-cased in staging and always point to their true
 * guilds, which prevents bugs like uploading a command to multiple guilds causing
 * a duplication crash in staging. The *brain*, however, *does* get special-cased
 * and always points to the staging guild in staging. Controllers are identity,
 * controller brains are behaviour.
 */
class Controller {
  constructor(
    private brain: ControllerBrain,
    private scope: string,
    private nick?: Exclude<GuildNickname, 'staging'>,
  ) {}

  /**
   * The logging name of this controller.
   */
  get name() {
    return this.nick ? `${this.scope}(${this.nick})` : this.scope;
  }

  /**
   * The file name of this controller, for controller-indexed caches like
   * the `/pory` command.
   */
  get file_name() {
    return this.nick ? `${this.scope}_${this.nick}` : this.scope;
  }

  /**
   * Disambiguates a name based on the controller nickname. This is used to change the
   * staging names of commands so they never overlap.
   *
   * It's important that this function be here rather than on `ControllerBrain`, because
   * only `Controller` knows which guild it's actually *meant* to be uploaded to in
   * production - the brain just knows it's in staging.
   */
  disambiguate_name_in_staging(name: string) {
    return IS_STAGING && this.nick ? `${name}-${this.nick}` : name;
  }

  /**
   * Returns whether Porygon is connected to this controller's guild, if the controller
   * describes a guild, or `true` if the controller is `GLOBAL`. Because `GLOBAL`
   * exists, checking that `try_into_guild` succeeds is not sufficient to decide
   * if a controller is connected.
   *
   * Used by tasks and initializers to decide if they should run their hooks.
   */
  is_connected(client: Client) {
    return this.brain.is_connected(client);
  }

  /**
   * Tests whether a hypothetical guild ID (or not!) matches a controller.
   * This is used by the initializer `EventProxy` to decide whether to delegate
   * events to an event handler added by a specific guild.
   */
  matches_guild(guild_id: Maybe<string>) {
    return this.brain.matches_guild(guild_id);
  }

  /**
   * Tries to look up a guild for this controller. This may be absent for several reasons:
   *   - We are in staging and there is no such guild.
   *   - We are in production but Porygon is not on that guild.
   *   - Calling the method on `GLOBAL`.
   */
  try_into_guild(client: Client) {
    return this.brain.try_into_guild(client);
  }

  /**
   * Uploads a command to the command interface describes by the controller brain.
   * If `id` is non-null, it will be replaced with the new command.
   */
  upload_command(id: Maybe<string>, data: Data, client: Client) {
    const iface = this.brain.into_upload_interface(client);
    return id ? iface.edit(id, data) : iface.create(data);
  }
}

export type { Controller };
export const GLOBAL = new Controller(BRAINS.global, 'global');
export const POKECOM = make_guild_controller('pc');
export const POKECOM_STAFF = make_guild_controller('pc_staff');
export const DUCK = make_guild_controller('duck');

function make_guild_controller(nick: Exclude<GuildNickname, 'staging'>) {
  return new Controller(BRAINS[nick], 'guild', nick);
}
