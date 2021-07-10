import {
  ApplicationCommand as Api,
  Collection,
  CommandInteraction,
} from 'discord.js';
import { logger } from 'porygon/logger';
import { Package } from 'porygon/package';
import { resolveId } from 'support/like';
import { LocalCommand as Local } from './local';

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

      yield new this(pkg, api, local);
    }
  }

  constructor(readonly pkg: Package, private api: Api, private local: Local) {}

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

  setPermission(type: 'USER' | 'ROLE', user: IdLike, permission: boolean) {
    const id = resolveId(user);
    return this.api.setPermissions([{ type, id, permission }]);
  }
}

type IdLike = string | { id: string };
