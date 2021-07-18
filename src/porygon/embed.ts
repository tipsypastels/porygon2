import { GuildMember, MessageEmbed, User } from 'discord.js';
import { AssetGroupKey } from './asset/group';
import { PORY_ASSETS } from './assets';
import COLORS from './colors.json';

type Reply = (embed: Embed) => Promise<void>;

interface ReplyInteraction {
  editReply(embed: Embed): Promise<void>;
  reply(embed: Embed): Promise<void>;
  replied: boolean;
}

type EmbeddableFn = (embed: Embed) => void;
type Embeddable = EmbeddableFn | { intoEmbed: EmbeddableFn };

type Nullish<T> = T | null | undefined;

interface SetAuthorFromOpts {
  withDiscriminator?: boolean;
  url?: string;
}

export class Embed extends MessageEmbed {
  merge(into: Embeddable | undefined) {
    if (into) {
      typeof into === 'object' ? into.intoEmbed(this) : into(this);
    }

    return this;
  }

  setColorIfNonZero(color: number) {
    if (color !== 0) this.setColor(color);
    return this;
  }

  poryThumb(thumb: AssetGroupKey<typeof PORY_ASSETS>) {
    return this.setThumbnail(PORY_ASSETS.get(thumb).url);
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

  if<T>(value: Nullish<T>, cb: (value: T, embed: this) => void) {
    if (value) cb(value, this);
    return this;
  }

  setAuthorFromUser(user: User | GuildMember, opts?: SetAuthorFromOpts): this {
    if (user instanceof GuildMember) {
      return this.setAuthorFromUser(user.user, opts);
    }

    const name = userToAuthor(user, opts?.withDiscriminator);
    return this.setAuthor(name, user.avatarURL()!, opts?.url);
  }

  setAuthorFromMember(member: GuildMember, opts?: SetAuthorFromOpts) {
    const name = memberToAuthor(member, opts?.withDiscriminator);
    return this.setAuthor(name, member.user.avatarURL()!, opts?.url);
  }
}

export namespace Embed {
  export class Replyable extends Embed {
    private _reply: Reply;

    constructor(_reply: Reply | ReplyInteraction) {
      super();

      this._reply = toReply(_reply);
    }

    reply() {
      return this._reply(this);
    }
  }
}

function toReply(reply: Reply | ReplyInteraction): Reply {
  if (typeof reply === 'function') {
    return reply;
  }

  return function (embed: Embed) {
    if (reply.replied) {
      return reply.editReply(embed);
    } else {
      return reply.reply(embed);
    }
  };
}

function memberToAuthor(member: GuildMember, withDiscrim = false) {
  const name = member.displayName;
  return withDiscrim ? `${name}#${member.user.discriminator}` : name;
}

function userToAuthor(user: User, withDiscrim = false): string {
  const name = user.username;
  return withDiscrim ? `${name}#${user.discriminator}` : name;
}
