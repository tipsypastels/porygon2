import './client/ascii';
import { Client as DiscordClient } from 'discord.js';
import { intents } from './client/intents';
import { logger } from './logger';
import { uptime } from './stats';
import { setupActivityMessages } from './activity_message';
import { setupAssets } from './asset/setup';
import { Package, setupPackages } from './package';

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

      Package.runCommand(this, interaction);
      // LibCommandManager.handle(this, interaction);
    });
  }

  private async setup() {
    await Promise.all([
      this.setupPackages(),
      this.setupActivityMessages(),
      this.setupStats(),
      this.setupAssets(),
    ]);
  }

  private async setupPackages() {
    await setupPackages(this);
  }

  private async setupActivityMessages() {
    setupActivityMessages(this);
  }

  private setupStats() {
    uptime.startTiming();
  }

  private async setupAssets() {
    await setupAssets();
  }
}

/**
 * The global client singleton.
 *
 * @see Porygon
 */
export const client = new Porygon();
