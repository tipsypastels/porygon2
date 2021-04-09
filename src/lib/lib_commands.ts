import { ApplicationCommand, Collection, CommandInteraction } from 'discord.js';
import { Command, removeCommandHandler } from 'interaction/command';
import { runCommand } from 'interaction/command/runtime';
import { basename } from 'path';
import { Porygon } from 'porygon/client';
import { logger } from 'porygon/logger';
import { isDev } from 'support/dev';
import { eachFileRecursive } from 'support/dir';
import { Lib } from './lib';

export class LibCommands {
  static handlers = new Collection<string, Command>();

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

  async import(dir: string, { global = false } = {}) {
    const promises = Array.from(eachFileRecursive(dir)).map(async (file) => {
      const mod = await import(file);

      if (!mod || !mod.default || Object.keys(mod.default).length === 0) {
        return logger.error(
          `${basename(file)} does not have a command default export.`,
        );
      }

      const command: Command = mod.default;
      const id = await this.addRegistration(command, global);

      if (id) {
        await this.addHandler(id, command);
      }
    });

    await Promise.all(promises);
  }

  private async addRegistration(command: Command, global: boolean) {
    const data = removeCommandHandler(command);
    let result: Promise<ApplicationCommand> | undefined;

    if (global && !isDev) {
      result = this.client.application?.commands.create(data);
    } else if (this.guild) {
      result = this.guild.commands.create(data);
    }

    if (result) {
      return (await result).id;
    }
  }

  private addHandler(id: string, command: Command) {
    LibCommands.handlers.set(id, command);
  }

  private get client() {
    return this.lib.client;
  }

  private get guild() {
    return this.client.guilds.cache.get(this.lib.guildId);
  }
}
