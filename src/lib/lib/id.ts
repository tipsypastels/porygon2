import { Guild } from 'discord.js';
import { isDev } from 'support/dev';

export abstract class LibId {
  abstract matchesGuild(guild: Guild): boolean;

  orDevId(): LibId {
    return isDev ? DEV : this;
  }
}

export class GuildLibId extends LibId {
  constructor(readonly guildId: string) {
    super();
  }

  matchesGuild(guild: Guild) {
    return this.guildId === guild.id;
  }
}

export class GlobalLibId extends LibId {
  matchesGuild() {
    return true;
  }
}

const DEV = new GuildLibId('746219046374080532');
