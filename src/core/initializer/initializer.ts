import { Controller, proper_controller_for_env } from 'core/controller';
import { logger, panic } from 'core/logger';
import { ControllerRegistrar } from 'core/registrar';
import { Client, Guild } from 'discord.js';
import { Cache } from 'support/cache';
import { Maybe } from 'support/null';
import { EventProxy } from './proxy';
import { error_is_skip } from './skip';

/**
 * An initializer is a function that runs on startup. Most exist to
 * register events and other handlers.
 */
export interface Initializer {
  (opts: InitializerOpts): void;
}

/** See `Initializer`. */
export interface InitializerOpts {
  client: ClientWithoutEvents;
  controller: Controller;
  events: EventProxy;
  guild: Maybe<Guild>;
}

/**
 * The Discord.js `Client`, without the `on` and `once` event registration methods.
 * This is used in initializers because those methods can be unsafe if they throw,
 * which would not be handled in any way and crash Porygon. Instead, the safe wrapper
 * `EventProxy` (which is also passed to initialziers) should be used.
 */
export type ClientWithoutEvents = Omit<Client, 'on' | 'once'>;

/**
 * A registrar for initializers. See `Initializer`.
 */
export class InitializerRegistrar extends ControllerRegistrar {
  private static CACHE = new Cache((controller: Controller) => new this(controller));
  private pending = new Set<Initializer>();

  static init(prod_controller: Controller) {
    const controller = proper_controller_for_env(prod_controller);
    return this.CACHE.get(controller);
  }

  protected constructor(controller: Controller) {
    super('inits', controller);
  }

  async synchronize(client: Client) {
    const { controller, tag } = this;
    const opts: InitializerOpts = {
      client,
      controller,
      events: new EventProxy(client, controller, tag),
      guild: controller.try_into_guild(client),
    };

    this.pending.forEach((f) => this.run(f, opts));
    this.pending.clear();
  }

  add_init(init: Initializer) {
    this.ensure_unique(init);
    this.pending.add(init);
  }

  private ensure_unique(init: Initializer) {
    if (this.pending.has(init)) {
      panic(`Initializer %${init.name}% was added twice to %${this.tag}%`);
    }
  }

  private run(f: Initializer, opts: InitializerOpts) {
    try {
      f(opts);
      logger.debug(`Ran initializer %${f.name}%`);
    } catch (e) {
      if (error_is_skip(e)) {
        logger.warn(`Initializer %${f.name}% skipped: %${e.message}%`);
      } else {
        panic(`Initializer %${f.name}% under %${this.tag}% failed`, e);
      }
    }
  }
}

export function add_init(controller: Controller, init: Initializer) {
  const registrar = InitializerRegistrar.init(controller);
  registrar.add_init(init);
}
