import { ApplicationCommand, Collection, Guild } from 'discord.js';
import { Command, removeCommandHandler } from 'interaction/command';
import { basename } from 'path';
import { Porygon } from 'porygon/client';
import { logger } from 'porygon/logger';
import { isDev } from 'support/dev';
import { eachFileRecursive } from 'support/dir';

type CommandMod = { default: Command };

/**
 * A wrapper around `Collection<string, Command>` with some additional logic, such
 * as importing a directory of commands.
 *
 * In development, this is a singleton class, as there is only one list of commands,
 * and treating it as several lists as you would in production will result in
 * commands overwriting each other.
 */
export abstract class CommandCollection extends Collection<string, Command> {
  private unsaved: Command[] = [];

  static create() {
    return isDev
      ? DevCommandCollection.create()
      : ProdCommandCollection.create();
  }

  protected constructor() {
    super();
  }

  async import(dir: string) {
    const files = Array.from(eachFileRecursive(dir));
    const promises = files.map(async (file) => {
      const mod = await import(file);

      if (this.modIsCommand(file, mod)) {
        return mod.default;
      }
    });

    for (const command of await Promise.all(promises)) {
      command && this.unsaved.push(command);
    }
  }

  async saveLib(client: Porygon, guild?: Guild) {
    // no-op
  }

  async saveAll(client: Porygon, guild: Guild) {
    // no-op
  }

  merge(other: CommandCollection) {
    // no-op
  }

  protected modIsCommand(file: string, mod: any): mod is CommandMod {
    if (!mod || !mod.default || Object.keys(mod.default).length === 0) {
      logger.error(`${basename(file)} does not have a command default export.`);
      return false;
    }

    return true;
  }

  protected async save(client: Porygon, guild?: Guild) {
    const results = await this.upload(client, guild);

    for (const [, result] of results) {
      const command = this.unsaved.find(zip(result));

      if (!command) {
        // fine in singleton mode, as you will get results that have
        // already been added to the main collection
        continue;
      }

      this.set(result.id, command);
    }

    this.unsaved = [];
  }

  protected upload(client: Porygon, guild?: Guild) {
    const commands = this.unsaved.map(removeCommandHandler);

    if (!guild && isDev) {
      throw new Error(
        'CommandCollection#save must be passed a guild in development.',
      );
    }

    if (guild) {
      return guild.commands.set(commands);
    } else {
      return client.application!.commands.set(commands);
    }
  }
}

class DevCommandCollection extends CommandCollection {
  private static instance?: DevCommandCollection;
  static create() {
    if (!this.instance) {
      this.instance = new this();
    }

    return this.instance;
  }

  saveAll(client: Porygon, guild: Guild) {
    return this.save(client, guild);
  }

  protected upload(client: Porygon, guild?: Guild) {
    if (!guild) {
      throw new Error(
        'CommandCollection#upload must be passed a guild in development.',
      );
    }

    return super.upload(client, guild);
  }
}

class ProdCommandCollection extends CommandCollection {
  static create() {
    return new this();
  }

  saveLib(client: Porygon, guild?: Guild) {
    return this.save(client, guild);
  }

  merge(other: CommandCollection) {
    for (const [id, command] of other) {
      this.set(id, command);
    }
  }
}

function zip(data: ApplicationCommand) {
  return (command: Command) => {
    if (command.commandName) return command.commandName === data.name;
    return command.name === data.name;
  };
}
