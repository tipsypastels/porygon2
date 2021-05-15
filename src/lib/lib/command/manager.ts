import {
  ApplicationCommand,
  ApplicationCommandData,
  Collection,
  CommandInteraction,
  Guild,
} from 'discord.js';
import {
  Command,
  effectiveCommandName,
  removeCommandFn,
} from 'interaction/command';
import { runCommand } from 'interaction/command/runtime';
import type { Lib } from 'lib/lib';
import { Porygon } from 'porygon/client';
import { logger } from 'porygon/logger';
import { LibCommandImporter } from './importer';

export class LibCommandManager {
  static handlers = new Collection<string, [Command, Lib]>();

  static async handle(client: Porygon, interaction: CommandInteraction) {
    const entry = this.handlers.get(interaction.commandID);

    if (!entry) {
      logger.error(
        `Got an interaction for nonexistant command ${interaction.commandName}`,
      );
      return;
    }

    const [command, lib] = entry;

    await runCommand({
      lib,
      command,
      interaction,
      client,
    });
  }

  private unsavedCommands: Command[] = [];

  constructor(readonly lib: Lib) {}

  has(commandName: string) {
    return !!LibCommandManager.handlers.find(([command, lib]) => {
      return lib === this.lib && effectiveCommandName(command) === commandName;
    });
  }

  async import(dir: string) {
    const importer = new LibCommandImporter(dir);
    const commands = await importer.toArray();

    this.unsavedCommands = this.unsavedCommands.concat(...commands);
  }

  async save() {
    const { unsavedCommands } = this;

    if (!unsavedCommands) {
      throw new Error(
        'LibCommandManager#save cannot be called before importing.',
      );
    }

    const apiCommandData = await this.upload(unsavedCommands);

    if (apiCommandData) {
      for (const [, apiCommand] of apiCommandData) {
        const command = unsavedCommands.find(zip(apiCommand));

        if (!command) {
          logger.error(
            `Failed to find match for API command ${apiCommand.name}`,
          );
          return;
        }

        this.set(apiCommand.id, command);
      }
    }
  }

  protected upload(commands: Command[]) {
    const data = commands.map(removeCommandFn);

    if (this.isGlobal) return this.uploadGlobal(data);
    if (this.guild) return this.uploadGuild(data, this.guild);
  }

  protected uploadGuild(data: ApplicationCommandData[], guild: Guild) {
    return guild.commands.set(data);
  }

  protected uploadGlobal(data: ApplicationCommandData[]) {
    return this.client.application!.commands.set(data);
  }

  protected set(id: string, command: Command) {
    LibCommandManager.handlers.set(id, [command, this.lib]);
  }

  private get client() {
    return this.lib.client;
  }

  private get guild() {
    return this.lib.guild;
  }

  private get isGlobal() {
    return this.lib.isGlobal;
  }
}

function zip(data: ApplicationCommand) {
  return (command: Command) => effectiveCommandName(command) === data.name;
}
