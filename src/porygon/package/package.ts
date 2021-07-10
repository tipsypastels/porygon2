import { Collection, CommandInteraction } from 'discord.js';
import { Porygon } from 'porygon/client';
import { Command, LocalCommand } from 'porygon/interaction';
import { logger } from 'porygon/logger';
import { areArraysStructurallyEqual } from 'support/array';
import { PackageKind } from './kind';

type CommandId = string;

export class Package {
  static ALL = new Collection<PackageKind, Package>();
  static SAVED_COMMANDS = new Collection<CommandId, Command>();
  private unsavedCommands: LocalCommand[] = [];

  static runCommand(interaction: CommandInteraction) {
    const command = this.SAVED_COMMANDS.get(interaction.commandID);

    if (!command) {
      logger.error(
        `Got an interaction for nonexistant command ${interaction.commandName}`,
      );
      return;
    }

    command.call(interaction);
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

  private constructor(private kind: PackageKind, readonly client: Porygon) {
    Package.ALL.set(kind, this);
  }

  hasCommand(name: string) {
    return !!this.getCommand(name);
  }

  getCommand(name: string) {
    return Package.SAVED_COMMANDS.find((command) => {
      return command.pkg === this && command.name === name;
    });
  }

  addCommand(local: LocalCommand) {
    this.unsavedCommands.push(local);
  }

  async uploadCommands() {
    const commandData = this.unsavedCommands.map((c) => c.data);
    const commandNames = commandData.map((n) => n.name);

    const apis = await this.kind.upload(commandData, this.client);

    if (apis) {
      const apiNames = [...apis.values()].map((n) => n.name);

      // FIXME: Remove this later.
      // We don't actually depend on this yet, but if the order is always
      // the same as the input, we can eliminate the need for command
      // names to be globally unique across packages.
      if (!areArraysStructurallyEqual(commandNames, apiNames)) {
        throw new Error('Command upload result not ordered.');
      }

      for (const command of Command.zip(this, apis, this.unsavedCommands)) {
        Package.SAVED_COMMANDS.set(command.id, command);
      }
    }

    this.unsavedCommands = [];
  }
}
