import { Interaction } from 'discord.js';
import { Porygon } from 'porygon/client';
import { LibCommands } from './lib_commands';

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
  private commands = new LibCommands(this);

  constructor(readonly client: Porygon, readonly guildId: string) {}

  importCommands(dir: string, { global = false } = {}) {
    return this.commands.import(dir, { global });
  }

  async importHandlers(dir: string) {
    /* TODO */
  }

  async handleInteraction(interaction: Interaction) {
    if (!interaction.isCommand()) {
      return;
    }

    await this.commands.handle(interaction);
  }
}
