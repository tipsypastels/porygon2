import { Porygon } from 'porygon/client';
import { CollectionCache } from 'support/cache';
import { LibCommandManager } from './command/manager';
import { LibEventManager } from './event/manager';

/**
 * A "lib" represents a block of behavior, including handlers and commands, that
 * are unique to a particular guild. This is used to easily compartmentalize
 * server-specific functionality.
 *
 * Every lib must have:
 * - a directory name matching `/^lib_/`
 * - a `lib.json` file with, at minimum, a `guildId` key
 * - an `index.ts` file that exports a setup callback
 *
 * Assuming conditions are met, an instance of this class will be created and
 * passed to each setup callback automatically.
 */
export class Lib {
  static instances = new CollectionCache<string, Lib>();

  static findOrCreate(client: Porygon, guildId: string) {
    return this.instances.findOr(guildId, () => new this(client, guildId));
  }

  static async saveAll() {
    await Promise.all(this.instances.mapValues((l) => l.save()));
  }

  private commands = new LibCommandManager(this);
  private events = new LibEventManager(this);
  private constructor(readonly client: Porygon, readonly guildId?: string) {}

  get guild() {
    if (this.guildId) {
      return this.client.guilds.cache.get(this.guildId);
    }
  }

  get isGlobal() {
    return !this.guildId;
  }

  async importCommands(dir: string) {
    await this.commands.import(dir);
  }

  async importEvents(dir: string) {
    await this.events.import(dir);
  }

  async save() {
    await this.commands.save();
  }
}
