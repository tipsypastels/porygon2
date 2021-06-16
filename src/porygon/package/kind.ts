import {
  ApplicationCommand as Cmd,
  ApplicationCommandData as CmdData,
  Collection,
} from 'discord.js';
import { Porygon } from 'porygon/client';
import { TEST_SERVER } from 'secrets.json';
import { isDev } from 'support/dev';

type UploadedCmds = Promise<Collection<string, Cmd> | undefined>;

/**
 * Disambiguates a particular package by encapsulating
 * different settings for guild-locking, where to upload commands, etc.
 */
export abstract class PackageKind {
  abstract matches(guildId: string | undefined): boolean;
  abstract upload(data: CmdData[], client: Porygon): UploadedCmds;
}

export namespace PackageKind {
  /**
   * A package kind that may be a `T` (in production) or `Dev` (in development).
   * This must be explicitly checked, since all `PackageKind`s are `Dev` in
   * development mode.
   */
  export type OrDev<T extends PackageKind> = T | Dev;

  /**
   * A package locked to the development mode server.
   * All `PackageKind`s are overridden to have this time in development mode.
   */
  export class Dev extends PackageKind {
    matches() {
      return true;
    }

    upload(data: CmdData[], client: Porygon) {
      const guild = client.guilds.cache.get(TEST_SERVER)!;
      return guild.commands.set(data);
    }
  }

  /**
   * The only `PackageKind` to exist in development.
   */
  export const DEV_SINGLETON = new PackageKind.Dev();

  /**
   * A package that applies to all guilds. Commands will be uploaded globally.
   */
  export class Global extends PackageKind {
    matches() {
      return true;
    }

    upload(data: CmdData[], client: Porygon) {
      return client.application!.commands.set(data);
    }
  }

  /**
   * A package that matches a single guild.
   */
  export class Guild extends PackageKind {
    constructor(private guildId: string) {
      super();
    }

    guild(client: Porygon) {
      return client.guilds.cache.get(this.guildId);
    }

    matches(guildId: string | undefined) {
      return this.guildId === guildId;
    }

    async upload(data: CmdData[], client: Porygon) {
      const guild = this.guild(client);

      if (!guild) {
        return;
      }

      return await guild.commands.set(data);
    }
  }

  /**
   * A package that matches several known guilds.
   */
  export class Guilds extends PackageKind {
    constructor(private guildIds: string[]) {
      super();
    }

    matches(guildId: string | undefined) {
      return !!guildId && this.guildIds.includes(guildId);
    }

    async upload(data: CmdData[], client: Porygon) {
      const promises = this.guildIds.map(async (id) => {
        const guild = client.guilds.cache.get(id);

        if (!guild) {
          return;
        }

        return await guild.commands.set(data);
      });

      // all entries should be the same
      const [cmds] = await Promise.all(promises);
      return cmds;
    }
  }
}
