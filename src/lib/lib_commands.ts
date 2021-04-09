import { Collection, CommandInteraction } from 'discord.js';
import { Command, removeCommandHandler } from 'interaction/command';
import { runCommand } from 'interaction/command/runtime';
import { basename } from 'path';
import { logger } from 'porygon/logger';
import { isDev } from 'support/dev';
import { eachFileRecursive } from 'support/dir';
import { Lib } from './lib';

export class LibCommands {
  private handlers = new Collection<string, Command>();

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

      await this.addRegistration(command, global);
      await this.addHandler(command);
    });

    await Promise.all(promises);
  }

  async handle(interaction: CommandInteraction) {
    const command = this.handlers.get(interaction.commandName);

    if (!command) {
      return; // TODO: log error
    }

    await runCommand({
      command,
      interaction,
      client: this.client,
    });
  }

  private addRegistration(command: Command, global: boolean) {
    const data = removeCommandHandler(command);

    if (global && !isDev) {
      return this.client.application?.commands.create(data);
    } else {
      return this.guild.commands.create(data);
    }
  }

  private addHandler(command: Command) {
    this.handlers.set(command.name, command);
  }

  private get client() {
    return this.lib.client;
  }

  private get guild() {
    return this.client.guilds.cache.get(this.lib.guildId)!;
  }
}
