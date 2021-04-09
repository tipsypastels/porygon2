import { Client as DiscordClient, Collection } from 'discord.js';
import type { Lib } from 'lib/base';
import { intents } from './client/intents';
import { logger } from './logger';

/**
 * The base Porygon class, which is a wrapper around discord.js's `Client`.
 */
export class PorygonClient extends DiscordClient {
  libs!: Collection<string, Lib>;

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

      const lib = this.libs.get(interaction.guild.id);

      if (!lib) {
        return;
      }

      lib.handleInteraction(this, interaction);
    });
  }

  private async setup() {
    await Promise.all([this.setupLibraries()]);
  }

  private async setupLibraries() {
    this.libs = (await import('../lib')).default;

    const promises = this.libs.map(async (lib) => {
      await lib.synchronize(this);
    });

    await Promise.all(promises);
  }
}

/**
 * The global client singleton.
 *
 * @see PorygonClient
 */
export const client = new PorygonClient();
