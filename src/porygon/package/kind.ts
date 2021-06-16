import {
  ApplicationCommand as Cmd,
  ApplicationCommandData as CmdData,
  Collection,
} from 'discord.js';
import { Porygon } from 'porygon/client';
import { packageSetupIsDone } from './done';

type UploadedCmds = Collection<string, Cmd> | undefined;

export abstract class PackageKind {
  protected unsavedCommands: CmdData[] = [];

  abstract matches(guildId: string): boolean;
  abstract saveCommands(client: Porygon): Promise<UploadedCmds>;

  addCommand(data: CmdData) {
    if (packageSetupIsDone()) {
      throw new Error(
        `Tried to create command "${data.name}" after package setup finished. Commands can't be created ad-hoc.`,
      );
    }

    this.unsavedCommands.push(data);
  }
}

export namespace PackageKind {
  // export class Dev extends PackageKind {
  //   matches() {
  //     return true;
  //   }
  // }

  export class Global extends PackageKind {
    matches() {
      return true;
    }

    saveCommands(client: Porygon) {
      return client.application!.commands.set(this.unsavedCommands);
    }
  }

  export class Guild extends PackageKind {
    constructor(private guildId: string) {
      super();
    }

    matches(guildId: string) {
      return this.guildId === guildId;
    }

    async saveCommands(client: Porygon) {
      const guild = client.guilds.cache.get(this.guildId);

      if (!guild) {
        return;
      }

      return await guild.commands.set(this.unsavedCommands);
    }
  }

  export class Guilds extends PackageKind {
    constructor(private guildIds: string[]) {
      super();
    }

    matches(guildId: string) {
      return this.guildIds.includes(guildId);
    }

    async saveCommands(client: Porygon) {
      const promises = this.guildIds.map(async (id) => {
        const guild = client.guilds.cache.get(id);

        if (!guild) {
          return;
        }

        return await guild.commands.set(this.unsavedCommands);
      });

      // all entries should be the same
      const [cmds] = await Promise.all(promises);
      return cmds;
    }
  }
}
