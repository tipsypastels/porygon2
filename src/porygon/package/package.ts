import { ApplicationCommand, Collection, CommandInteraction } from 'discord.js';
import { Porygon } from 'porygon/client';
import { Command } from 'porygon/interaction/command';
import { logger } from 'porygon/logger';
import { PackageKind } from './kind';

type CommandId = string;

export class Package {
  static ALL = new Collection<PackageKind, Package>();
  static SAVED_COMMANDS = new Collection<CommandId, [Command, Package]>();
  private unsavedCommands: Command[] = [];

  static runCommand(client: Porygon, interaction: CommandInteraction) {
    const entry = this.SAVED_COMMANDS.get(interaction.commandID);

    if (!entry) {
      logger.error(
        `Got an interaction for nonexistant command ${interaction.commandName}`,
      );
      return;
    }

    const [command, pkg] = entry;
    command.call({ pkg, client, interaction });
  }

  static uploadAllCommands() {
    return Promise.all(this.ALL.map((p) => p.uploadCommands()));
  }

  static init(kind: PackageKind, client: Porygon) {
    if (this.ALL.has(kind)) {
      return this.ALL.get(kind)!;
    }

    return new this(kind, client);
  }

  private constructor(private kind: PackageKind, private client: Porygon) {
    Package.ALL.set(kind, this);
  }

  hasCommand(commandName: string) {
    return !!Package.SAVED_COMMANDS.find(([command, pkg]) => {
      return pkg === this && command.name === commandName;
    });
  }

  addCommand(command: Command) {
    this.unsavedCommands.push(command);
  }

  async uploadCommands() {
    const commandData = this.unsavedCommands.map((c) => c.data);
    const res = await this.kind.upload(commandData, this.client);

    if (res) {
      for (const [, apiCommand] of res) {
        this.matchCommandAndMarkAsSaved(apiCommand);
      }
    }

    this.unsavedCommands = [];
  }

  private matchCommandAndMarkAsSaved(apiCommand: ApplicationCommand) {
    const command = this.unsavedCommands.find((command) => {
      return command.name === apiCommand.name;
    });

    if (!command) {
      logger.error(`Failed to find match for API command ${apiCommand.name}.`);
      return;
    }

    Package.SAVED_COMMANDS.set(apiCommand.id, [command, this]);
  }
}
