import { Client as DiscordClient } from 'discord.js';
import { setupLibs, getLib } from 'lib';
import { intents } from './client/intents';
import { logger } from './logger';
import { uptime } from './stats';

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
      if (!interaction.guild) {
        return;
      }

      const lib = getLib(interaction.guild.id);

      if (!lib) {
        return;
      }

      lib.handleInteraction(interaction);
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
