import {
  ApplicationCommand as Api,
  Collection,
  CommandInteraction,
} from 'discord.js';
import { logger } from 'porygon/logger';
import { Package } from 'porygon/package';
import { LocalCommand as Local } from './local';

/**
 * The arguments needed to construct a `Command`. Not to be confused with
 * `CommandFnArgs`, the arguments passed to a command function.
 */
export interface CommandArgs {
  local: Local;
  api: Api;
  pkg: Package;
}

/** The format discord.js gives you upload results in. */
type Apis = Collection<string, Api>;

/**
 * The top-level command wrapper class. This encapsulates a `LocalCommand` and
 * an `ApplicationCommand`, wrapping the functionality of both.
 *
 * `Command`s are created during the setup phase and can never be created outside
 * of that.
 */
export class Command {
  static *zip(pkg: Package, apis: Apis, locals: Local[]) {
    for (const [, api] of apis) {
      const local = locals.find((l) => l.name === api.name);

      if (!local) {
        logger.error(`Failed to find match for API command ${api.name}`);
        continue;
      }

      yield new this({ local, api, pkg });
    }
  }

  private local: Local;
  private api: Api;

  readonly pkg: Package;

  constructor(args: CommandArgs) {
    this.local = args.local;
    this.api = args.api;
    this.pkg = args.pkg;
  }

  get id() {
    return this.api.id;
  }

  get name() {
    return this.api.name;
  }

  get client() {
    return this.pkg.client;
  }

  private get data() {
    return this.local.data;
  }

  call(interaction: CommandInteraction) {
    this.local.call(this, interaction);
  }
}
