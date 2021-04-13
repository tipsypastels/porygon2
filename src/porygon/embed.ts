import {
  ColorResolvable,
  CommandInteraction,
  GuildMember,
  MessageEmbed,
} from 'discord.js';
import { PORY_PORTRAIT } from './asset';
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

  poryPortrait() {
    return this.setThumbnail(PORY_PORTRAIT);
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
  setAuthor(name: string, iconURL?: string, url?: string): this;
  setAuthor(nameOrMember: any, iconURL?: any, url?: any): this {
    if (nameOrMember instanceof GuildMember) {
      return super.setAuthor(
        nameOrMember.displayName,
        nameOrMember.user.avatarURL()!,
      );
    }

    return super.setAuthor(nameOrMember, iconURL, url);
  }
}
