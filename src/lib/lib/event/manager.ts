import { Guild, ClientEvents as Events } from 'discord.js';
import { Lib } from '..';
import { LibEventImporter } from './importer';

export class LibEventManager {
  constructor(readonly lib: Lib) {}

  async import(dir: string) {
    const importer = new LibEventImporter(dir);
    await importer.import((handler) => handler({ em: this }));
  }

  on<K extends keyof Events>(key: K, handler: (...args: Events[K]) => void) {
    const thisGuild = this.assertGuild();

    this.client.on<K>(key, (...args) => {
      const guild = this.extractGuild(args[0]);

      if (this.isGlobal || guild?.id === thisGuild?.id) {
        handler(...args);
      }
    });

    return this;
  }

  get client() {
    return this.lib.client;
  }

  get guild() {
    return this.lib.guild;
  }

  get isGlobal() {
    return this.lib.isGlobal;
  }

  private assertGuild(): Guild | undefined {
    if (!this.isGlobal && !this.guild) {
      throw new Error(
        `Tried to use lib handler on a nonexistant guild: ${this.lib.guildId}`,
      );
    }

    return this.guild;
  }

  private extractGuild(arg: any): Guild | undefined {
    if (arg instanceof Guild) return arg;
    if ('guild' in arg) return arg.guild;
  }
}
