import { Client as DiscordClient } from 'discord.js';
import { setupLibs } from 'lib';
import { LibCommandManager } from 'lib/lib_command_manager';
import { intents } from './client/intents';
import { logger } from './logger';
import { uptime } from './stats';
import './client/ascii';

/**
 * The base Porygon class, which is a wrapper around discord.js's `Client`.
 */
export class Porygon extends DiscordClient {
  constructor() {
    super({ intents });

    this.once('ready', async () => {
      await this.setup();

      logger.info('Porygon is ready!');
    });

    this.on('interaction', (interaction) => {
      if (!interaction.guild || !interaction.isCommand()) {
        return;
      }

      LibCommandManager.handle(this, interaction);
    });
  }

  private async setup() {
    await Promise.all([this.setupLibs(), this.setupStats()]);
  }

  private async setupLibs() {
    await setupLibs(this);
  }

  private setupStats() {
    uptime.startTiming();
  }
}

/**
 * The global client singleton.
 *
 * @see Porygon
 */
export const client = new Porygon();
