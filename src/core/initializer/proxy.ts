import { Controller } from 'core/controller';
import { logger } from 'core/logger';
import { Client, ClientEvents as Events, Guild } from 'discord.js';
import { Maybe } from 'support/null';

type Event = keyof Events;
type Callback<K extends Event> = (...args: Events[K]) => void;
type Occurrence = 'on' | 'once';

/**
 * An event builder for guild-local events. Wraps client even handlers, but
 * runs them through a check to ensure the guild matches.
 */
export class EventProxy {
  constructor(
    private client: Client,
    private controller: Controller,
    private registrar_tag: string,
  ) {}

  on<K extends Event>(key: K, cb: Callback<K>) {
    return this.proxy('on', key, cb);
  }

  once<K extends Event>(key: K, cb: Callback<K>) {
    return this.proxy('once', key, cb);
  }

  global_on<K extends Event>(key: K, cb: Callback<K>) {
    return this.client.on(key, cb);
  }

  global_once<K extends Event>(key: K, cb: Callback<K>) {
    return this.client.once(key, cb);
  }

  private proxy<K extends Event>(occ: Occurrence, key: K, cb: Callback<K>) {
    return this.client[occ](key, (...args) => {
      const guild = into_guild(args[0]);

      if (this.controller.matches_guild(guild?.id)) {
        try {
          cb(...args);
        } catch (e) {
          logger.error(`Error in event proxy under %${this.registrar_tag}%`, e);
        }
      }
    });
  }
}

function into_guild(arg: any): Maybe<Guild> {
  if (arg instanceof Guild) return arg;
  if (arg.guild instanceof Guild) return arg.guild;
}
