import { Porygon } from 'porygon/client';
import { LibCommandManager } from './lib_command_manager';
import { LibEventManager } from './lib_event_manager';

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
  private commands = new LibCommandManager(this);
  private events = new LibEventManager(this);

  constructor(readonly client: Porygon, readonly guildId: string) {}

  async importCommands(dir: string) {
    await this.commands.import(dir);
  }

  async importEvents(dir: string) {
    await this.events.import(dir);
  }
}
