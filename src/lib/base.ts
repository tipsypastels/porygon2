import { PorygonClient } from 'porygon/client';
import { TEST_SERVER } from 'secrets.json';
import { chooseIfDev } from 'support/dev';
import { Interaction } from 'discord.js';
import { CommandSynchronizer } from './base/command_sync';
import { logger } from 'porygon/logger';

export interface LibOpts {
  name: string;
  prodGuildId: string;
  dirName: string;
  handler?(): Promise<void>;
  filter?(): boolean;
  commands?: CommandSynchronizer;
}

export class Lib {
  readonly name: string;
  readonly guildId: string;
  readonly dirName: string;

  private handler?: () => Promise<void>;
  private filter: () => boolean;
  private commands: CommandSynchronizer;

  constructor(opts: LibOpts) {
    this.name = opts.name;
    this.guildId = chooseIfDev(opts.prodGuildId, TEST_SERVER);
    this.dirName = opts.dirName;
    this.handler = opts.handler;
    this.filter = opts.filter ?? (() => true);
    this.commands = opts.commands ?? new CommandSynchronizer();
  }

  toCollectionEntry() {
    return [this.guildId, this] as const;
  }

  async handleInteraction(client: PorygonClient, interaction: Interaction) {
    if (!interaction.isCommand()) {
      return;
    }

    this.commands.handle(client, interaction);
  }

  async synchronize(client: PorygonClient) {
    logger.info(`Synchronizing lib${this.name}...`);

    await this.commands.synchronize(this, client);
  }
}
