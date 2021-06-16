import {
  ApplicationCommand as Cmd,
  ApplicationCommandData as CmdData,
  Collection,
} from 'discord.js';
import { Porygon } from 'porygon/client';
import { TEST_SERVER } from 'secrets.json';
import { Cache, Singleton } from 'support/cache';

type UploadedCmds = Promise<Collection<string, Cmd> | undefined>;

/**
 * Disambiguates a particular package by encapsulating
 * different settings for guild-locking, where to upload commands, etc.
 */
export abstract class PackageKind {
  protected constructor() {
    /* nop */
  }

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
    private static VALUE = new Singleton<Dev>(() => {
      return new PackageKind.Dev();
    });

    static init() {
      return this.VALUE.get();
    }

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
  export const DEV_SINGLETON = PackageKind.Dev.init();

  /**
   * A package that applies to all guilds. Commands will be uploaded globally.
   */
  export class Global extends PackageKind {
    private static VALUE = new Singleton<Global>(() => {
      return new PackageKind.Global();
    });

    static init() {
      return this.VALUE.get();
    }

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
    private static ALL = new Cache((guildId: string) => {
      return new PackageKind.Guild(guildId);
    });

    static init(guildId: string) {
      return this.ALL.get(guildId);
    }

    protected constructor(private guildId: string) {
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
   *
   * NOTE: Instead of storing guild IDs directly, it
   * takes sub-`PackageKind`s. This is so the kinds
   * can be de-duped properly and don't clobber
   * each other's commands, as would happen
   * if we uploaded them directly.
   */
  export class Guilds extends PackageKind {
    packages: PackageKind.Guild[];

    constructor(guildIds: string[]) {
      super();

      this.packages = guildIds.map((i) => PackageKind.Guild.init(i));
    }

    matches(guildId: string | undefined) {
      return !!guildId && this.packages.some((p) => p.matches(guildId));
    }

    async upload(data: CmdData[], client: Porygon) {
      const promises = this.packages.map((pkg) => {
        return pkg.upload(data, client);
      });

      // all entries should be the same
      const [cmds] = await Promise.all(promises);
      return cmds;
    }
  }
}
