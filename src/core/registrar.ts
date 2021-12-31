import { Client } from 'discord.js';
import { OnceSet } from 'support/cache';
import { Controller } from './controller';
import { logger, panic } from './logger';

/**
 * The registrar master class.
 *
 * Registrars are classes that manage a *resource*, such as commands or initializers.
 * There is a registrar subclass for each type of resource, as they all have different
 * jobs to do, and not that much structural similarity between them.
 *
 * The master class is fairly simple - all it does is log its creation, maintain
 * an array of all instances, and provide a `synchronize` static method that runs
 * setup for all of them.
 */
export abstract class Registrar {
  private static INSTANCES: Registrar[] = [];
  private static _synced = false;

  static async synchronize(client: Client) {
    if (this._synced) {
      panic('Tried to synchronize registrars twice!');
    }

    logger.debug('Setup phase: %synchronization%.');

    const syncs = this.INSTANCES.map((x) => x.synchronize(client));
    await Promise.all(syncs);
    this._synced = true;
  }

  static get synced() {
    return this._synced;
  }

  abstract synchronize(client: Client): Promise<void>;

  protected constructor(readonly name: string) {
    logger.debug(`Created registrar %${this.name}%.`);
    Registrar.INSTANCES.push(this);
  }
}

/**
 * A subset of registrars - those that work closely with a `Controller` and are
 * memoized based on it. Most registrars (such as those for commands and initializers)
 * require a controller, but others such as assets do not.
 *
 * Memoization is done by the individual subclasses for the purpose of type safety
 * and convenience. Sadly Typescript doesn't have anything like `static abstract`,
 * but it's an implicit contract of `ControllerRegistrar` subclasses that they will
 * maintain a `CACHE` static variable of instances keyed by controllers, and wrap
 * their private constructors with a static `init` method that fetches or creates
 * instances.
 */
export abstract class ControllerRegistrar extends Registrar {
  private static DID_LOG_DISCONNECTED = new OnceSet<Controller>();

  protected constructor(type_name: string, protected controller: Controller) {
    super(`${type_name}_${controller.name}`);
  }

  protected abstract synchronize_if_connected(client: Client): Promise<void>;

  async synchronize(client: Client) {
    if (this.controller.is_connected(client)) {
      return await this.synchronize_if_connected(client);
    } else if (this.no_registrar_has_already_logged_disconnection()) {
      logger.warn(`Controller %${this.controller.name}% is disconnected!`);
    }
  }

  private no_registrar_has_already_logged_disconnection() {
    return ControllerRegistrar.DID_LOG_DISCONNECTED.try_add(this.controller);
  }
}
