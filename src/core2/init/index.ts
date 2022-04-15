import { assert } from 'core/assert';
import { Controller } from 'core/controller';
import { logger, panic } from 'core/logger';
import { ClientWithoutEvents } from 'core2/client/types';
import { add_setup_step } from 'core2/setup/step';
import { Guild } from 'discord.js';
import { Maybe } from 'support/null';
import { EventProxy } from './proxy';

/**
 * An initializer is a function that runs on startup. Most exist to
 * register events and other handlers.
 */
export interface Init {
  (opts: InitOpts): void;
}

/**
 * Registration data needed to add an initializer.
 */
export interface InitData {
  name: string;
  floating?: boolean;
}

/**
 * Options passed to a running initializer.
 */
export interface InitOpts {
  client: ClientWithoutEvents;
  controller: Controller;
  events: EventProxy;
  guild: Maybe<Guild>;
}

/**
 * Adds an initialization task.
 */
export function add_init(controller: Controller, init: Init, data: InitData) {
  type Item = [Init, InitData];
  type Store = Map<Init, InitData>;

  const name = `${data.name}_${controller.name}_init`;
  const { floating } = data;

  add_setup_step<Item, Store>([init, data], {
    name,
    floating,

    store_create() {
      return new Map();
    },

    store_push([init, data], store) {
      assert(!store.has(init), `%${name}% was registered twice!`);
      store.set(init, data);
    },

    async execute(client, store) {
      const opts: InitOpts = {
        client,
        controller,
        events: new EventProxy(client, controller, name),
        guild: controller.try_into_guild(client),
      };

      for (const [init, data] of store) {
        try {
          init(opts);
          logger.debug(`Ran initializer %${data.name}%`);
        } catch (e) {
          panic(`Initializer %${name}% failed`, e);
        }
      }
    },

    skip_if(client) {
      return !controller.is_connected(client);
    },
  });
}
