import {
  ColorResolvable,
  CommandInteraction,
  GuildMember,
  MessageEmbed,
} from 'discord.js';
import { isDev } from 'support/dev';
import { PORY_THUMBS } from './asset';
import COLORS from './colors.json';

type Reply = (embed: PorygonEmbed) => Promise<void>;
type EmbeddableFn = (embed: PorygonEmbed) => void;
type Embeddable = EmbeddableFn | { intoEmbed: EmbeddableFn };

export class PorygonEmbed extends MessageEmbed {
  static fromInteraction(interaction: CommandInteraction) {
    return new this(async (embed) => {
      interaction.replied
        ? await interaction.editReply(embed)
        : await interaction.reply(embed);
    });
  }

  constructor(private _reply?: Reply) {
    super();
  }

  setColorIfNonZero(color: ColorResolvable) {
    if (color !== 0) {
      this.setColor(color);
    }

    return this;
  }

  reply() {
    if (!this._reply) {
      throw new Error(
        "Can't use PorygonEmbed#reply when a reply callback is not provided to the constructor.",
      );
    }

    return this._reply(this);
  }

  merge(into: Embeddable) {
    typeof into === 'object' ? into.intoEmbed(this) : into(this);
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
