import { CommandInteraction } from 'discord.js';
import { runCommand } from 'interaction/command/runtime';
import { Porygon } from 'porygon/client';
import { logger } from 'porygon/logger';
import { CommandCollection } from './command_collection';
import { Lib } from './lib';

export class LibCommands {
  static handlers = CommandCollection.create();

  static saveAll(client: Porygon, guildId: string) {
    const guild = client.guilds.cache.get(guildId)!;
    return this.handlers.saveAll(client, guild);
  }

  static async handle(client: Porygon, interaction: CommandInteraction) {
    const command = this.handlers.get(interaction.commandID);

    if (!command) {
      logger.error(
        `Got an interaction for nonexistant command ${interaction.commandName}.`,
      );
      return;
    }

    await runCommand({
      command,
      interaction,
      client,
    });
  }

  constructor(readonly lib: Lib) {}

  async import(dir: string) {
    const output = CommandCollection.create();

    await output.import(dir);
    await output.saveLib(this.client, this.guild);

    LibCommands.handlers.merge(output);
  }

  private get client() {
    return this.lib.client;
  }

  private get guild() {
    return this.client.guilds.cache.get(this.lib.guildId);
  }
}
