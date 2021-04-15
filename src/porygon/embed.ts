import {
  ColorResolvable,
  CommandInteraction,
  GuildMember,
  MessageEmbed,
} from 'discord.js';
import { isDev } from 'support/dev';
import { PORY_THUMBS } from './asset';
import COLORS from './colors.json';

type Reply = CommandInteraction['reply'];
type IntoEmbeddable = { intoEmbed(embed: PorygonEmbed): unknown };

export class PorygonEmbed extends MessageEmbed {
  constructor(private _reply: Reply) {
    super();
  }

  setColorIfNonZero(color: ColorResolvable) {
    if (color !== 0) {
      this.setColor(color);
    }

    return this;
  }

  reply() {
    return this._reply(this);
  }

  merge(into: IntoEmbeddable) {
    into.intoEmbed(this);
    return this;
  }

  poryThumb(thumb: keyof typeof PORY_THUMBS) {
    let url = PORY_THUMBS[thumb];

    if (isDev) {
      url += `?${Date.now()}`;
    }

    return this.setThumbnail(url);
  }

  okColor() {
    return this.setColor(COLORS.ok);
  }

  infoColor() {
    return this.setColor(COLORS.info);
  }

  errorColor() {
    return this.setColor(COLORS.error);
  }

  warningColor() {
    return this.setColor(COLORS.warning);
  }

  dangerColor() {
    return this.setColor(COLORS.danger);
  }

  addInlineField(name: any, value: any) {
    return this.addField(name, value, true);
  }

  addFieldIfPresent(name: any, value: any) {
    if (value) {
      this.addField(name, value);
    }

    return this;
  }

  setAuthor(member: GuildMember): this;
  setAuthor(name: string, iconUrl?: string, url?: string): this;
  setAuthor(...args: any[]): this {
    if (args[0] instanceof GuildMember) {
      const [member] = args;
      return super.setAuthor(member.displayName, member.user.avatarURL()!);
    }

    const [name, iconUrl, url] = args;
    return super.setAuthor(name, iconUrl, url);
  }
}
