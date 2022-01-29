import { Controller } from 'core/controller';
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

/**
 * Data passed to an initializer when adding it.
 */
export interface InitializerData {
  name: string;
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
  private pending = new Map<Initializer, InitializerData>();

  static init(controller: Controller) {
    return this.CACHE.get(controller);
  }

  protected constructor(controller: Controller) {
    super('inits', controller);
  }

  protected async synchronize_if_connected(client: Client) {
    const { controller, name } = this;
    const opts: InitializerOpts = {
      client,
      controller,
      events: new EventProxy(client, controller, name),
      guild: controller.try_into_guild(client),
    };

    this.pending.forEach((data, f) => this.run(f, data, opts));
    this.pending.clear();
  }

  add_init(init: Initializer, data: InitializerData) {
    this.ensure_unique(init, data);
    this.pending.set(init, data);
  }

  private ensure_unique(init: Initializer, data: InitializerData) {
    if (this.pending.has(init)) {
      panic(`Initializer %${data.name}% was added twice to %${this.name}%`);
    }
  }

  private run(f: Initializer, data: InitializerData, opts: InitializerOpts) {
    try {
      f(opts);
      logger.debug(`Ran initializer %${data.name}%`);
    } catch (e) {
      if (error_is_skip(e)) {
        logger.warn(`Initializer %${data.name}% skipped: %${e.message}%`);
      } else {
        panic(`Initializer %${data.name}% under %${this.name}% failed`, e);
      }
    }
  }
}

export function add_init(
  controller: Controller,
  init: Initializer,
  data: InitializerData,
) {
  const registrar = InitializerRegistrar.init(controller);
  registrar.add_init(init, data);
}
