import './client/ascii';
import { Client as DiscordClient } from 'discord.js';
import { setupLibs } from 'lib';
import { LibCommandManager } from 'lib/lib_command_manager';
import { intents } from './client/intents';
import { logger } from './logger';
import { uptime } from './stats';
import { Setting } from './settings';
import { setupActivityMessages } from './activity_message';

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
    await Promise.all([
      this.setupLibs(),
      this.setupActivityMessages(),
      this.setupStats(),
    ]);
    await this.setupSettings(); // runs after all settings are loaded
  }

  private async setupLibs() {
    await setupLibs(this);
  }

  private async setupSettings() {
    await Setting.synchronize();
  }

  private async setupActivityMessages() {
    setupActivityMessages(this);
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
