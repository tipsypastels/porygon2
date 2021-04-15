import { ApplicationCommand, Collection, CommandInteraction } from 'discord.js';
import { Command, removeCommandHandler } from 'interaction/command';
import { runCommand } from 'interaction/command/runtime';
import { Lib } from 'lib/lib';
import { Porygon } from 'porygon/client';
import { logger } from 'porygon/logger';
import { LibCommandImporter } from './importer';

export class LibCommandManager {
  static handlers = new Collection<string, Command>();

  static async handle(client: Porygon, interaction: CommandInteraction) {
    const command = this.handlers.get(interaction.commandID);

    if (!command) {
      logger.error(
        `Got an interaction for nonexistant command ${interaction.commandName}`,
      );
      return;
    }

    await runCommand({
      command,
      interaction,
      client,
    });
  }

  private unsavedCommands: Command[] = [];

  constructor(readonly lib: Lib) {}

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

    for (const [, apiCommand] of apiCommandData) {
      const command = unsavedCommands.find(zip(apiCommand));

      if (command) {
        this.set(apiCommand.id, command);
      } else {
        logger.error(`Failed to find match for API command ${apiCommand.name}`);
      }
    }
  }

  protected upload(commands: Command[]) {
    const commandData = commands.map(removeCommandHandler);
    if (this.guild) {
      return this.guild.commands.set(commandData);
    }
    return this.client.application!.commands.set(commandData);
  }

  protected set(id: string, command: Command) {
    LibCommandManager.handlers.set(id, command);
  }

  private get client() {
    return this.lib.client;
  }

  private get guild() {
    return this.lib.guild;
  }
}

function zip(data: ApplicationCommand) {
  return (command: Command) => {
    if (command.commandName) return command.commandName === data.name;
    return command.name === data.name;
  };
}
