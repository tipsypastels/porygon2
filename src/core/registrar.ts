import { Client } from 'discord.js';
import { Controller } from './controller';
import { logger, panic } from './logger';

/**
 * The registrar master class.
 *
 * Registrars are classes that manage a *resource*, such as commands or initializers.
 * There is a registrar subclass for each type of resource, as they all have different
 * jobs to do, and not that much structural similarity between them.
 *
 * The master class is fairly simple - all it does is log its creation, and maintain
 * an array of all instances.
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

  protected constructor(readonly tag: string) {
    logger.debug(`Created registrar %${this.tag}%.`);
    Registrar.INSTANCES.push(this);
  }
}

/**
 * A subset of registrars - those that work closely with a `Controller` and are
 * memoized based on it. Most registrars (such as those for commands and initializers)
 * require a controller, but others such as assets do not.
 *
 * Memoization is done by the individual subclasses for the purpose of type safety
 * and convenience.
 */
export abstract class ControllerRegistrar extends Registrar {
  protected constructor(type_tag: string, protected controller: Controller) {
    super(`${type_tag}-${controller.tag}`);
  }
}
