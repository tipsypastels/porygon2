import { Guild, ClientEvents as Events } from 'discord.js';
import { basename } from 'path';
import { logger } from 'porygon/logger';
import { eachFileRecursive } from 'support/dir';
import { Lib } from './lib';

export type GuildHandlerArgs = {
  em: LibEventManager;
};
export type GuildHandler = (args: GuildHandlerArgs) => void | Promise<void>;

export class LibEventManager {
  constructor(readonly lib: Lib) {}

  async import(dir: string) {
    const promises = Array.from(eachFileRecursive(dir)).map(async (file) => {
      const mod = await import(file);

      if (!mod || !mod.default || typeof mod.default !== 'function') {
        logger.error(`Guild handler ${basename(file)} has no default export`);
        return;
      }

      const handler = mod.default as GuildHandler;

      handler({ em: this });
    });

    await Promise.all(promises);
  }

  on<K extends keyof Events>(key: K, handler: (...args: Events[K]) => void) {
    const thisGuild = this.assertGuild();

    this.client.on<K>(key, (...args) => {
      const guild = this.extractGuild(args[0]);

      if (guild?.id === thisGuild.id) {
        handler(...args);
      }
    });

    return this;
  }

  get client() {
    return this.lib.client;
  }

  get guild() {
    return this.client.guilds.cache.get(this.lib.guildId);
  }

  private assertGuild() {
    if (!this.guild) {
      throw new Error('Tried to use lib handler on a nonexistant guild.');
    }

    return this.guild;
  }

  private extractGuild(arg: any): Guild | undefined {
    if (arg instanceof Guild) return arg;
    if ('guild' in arg) return arg.guild;
  }
}
