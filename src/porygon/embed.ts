import {
  CommandInteraction,
  GuildMember,
  MessageEmbed,
  User,
} from 'discord.js';
import { PORY_ASSETS } from './assets';
import COLORS from './colors.json';

type Reply = (embed: PorygonEmbed) => Promise<void>;

type EmbeddableFn = (embed: PorygonEmbed) => void;
type Embeddable = EmbeddableFn | { intoEmbed: EmbeddableFn };

type Nullish<T> = T | null | undefined;
type Transform<T> = (from: T) => any;

type SetAuthorFromOpts = {
  withDiscriminator?: boolean;
  url?: string;
};

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

  setColorIfNonZero(color: number) {
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

  poryThumb(thumb: keyof typeof PORY_ASSETS) {
    return this.setThumbnail(PORY_ASSETS[thumb].url);
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

  addFieldIfPresent<T>(name: any, value: Nullish<T>, transform?: Transform<T>) {
    if (value) {
      if (transform) value = transform(value);
      this.addField(name, value);
    }

    return this;
  }

  setAuthorFromUser(user: User | GuildMember, opts?: SetAuthorFromOpts): this {
    if (user instanceof GuildMember) {
      return this.setAuthorFromUser(user.user, opts);
    }

    const name = opts?.withDiscriminator
      ? `${user.username}#${user.discriminator}`
      : user.username;

    return this.setAuthor(name, user.avatarURL()!, opts?.url);
  }

  setAuthorFromMember(member: GuildMember, opts?: SetAuthorFromOpts) {
    const name = opts?.withDiscriminator
      ? `${member.displayName}#${member.user.discriminator}`
      : member.displayName;

    return this.setAuthor(name, member.user.avatarURL()!, opts?.url);
  }
}
