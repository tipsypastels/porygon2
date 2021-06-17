import {
  ApplicationCommandData as Data,
  CommandInteraction,
  CommandInteractionOption,
  Guild,
  GuildMember,
  TextChannel,
} from 'discord.js';
import { Porygon } from 'porygon/client';
import { Embed } from 'porygon/embed';
import { logger } from 'porygon/logger';
import { Package } from 'porygon/package';
import { extractOnlyKey } from 'support/object';
import { catchInteractionError } from './catch';

type DataOptionalName = Omit<Data, 'name'> & { name?: string };

export class Command<O = never> {
  private fn: Command.Fn<O>;
  readonly data: Data;

  constructor(fn: Command.Fn<O>, data: DataOptionalName) {
    this.fn = fn;
    this.data = { ...data, name: data.name ?? fn.name };
  }

  get name() {
    return this.data.name;
  }

  async call({ pkg, client, interaction }: Command.CallArgs) {
    const opts = extractOptions<O>(interaction);
    const embed = new Embed.Replyable(interaction);
    const guild = interaction.guild!; // safe, porygon doesnt support globals
    const member = interaction.member as GuildMember;
    const channel = interaction.channel as TextChannel;

    const args: Command.Args<O> = {
      pkg,
      client,
      interaction,
      opts,
      embed,
      guild,
      member,
      channel,
    };

    try {
      await this.fn(args);

      logger.cmd(
        `${member.user.username} used command ${this.name} in ${channel.name}, ${guild.name}`,
      );
    } catch (e) {
      catchInteractionError(e, embed);
    }
  }
}

export namespace Command {
  export interface CallArgs {
    pkg: Package;
    client: Porygon;
    interaction: CommandInteraction;
  }

  export interface Args<O = never> {
    client: Porygon;
    guild: Guild;
    member: GuildMember;
    channel: TextChannel;
    embed: Embed.Replyable;
    interaction: CommandInteraction;
    opts: O;
    pkg: Package;
  }

  export interface Fn<O = never> {
    (args: Args<O>): Promise<void>;
  }

  type MultipartFns<O> = {
    [K in keyof O]: Command.Fn<O[K]>;
  };

  export class Multipart<O> extends Command<O> {
    constructor(fns: MultipartFns<O>, data: Data) {
      const fn: Command.Fn<O> = async (args) => {
        const key = extractOnlyKey(args.opts);
        const newArgs = { ...args, opts: args.opts[key] };
        await fns[key](newArgs);
      };

      super(fn, data);
    }
  }
}

function extractOptions<O>(interaction: CommandInteraction) {
  const out: any = {};

  for (const option of interaction.options) {
    extractOption(option, out);
  }

  return out as O;
}

function extractOption(option: CommandInteractionOption, out: any = {}) {
  switch (option.type) {
    case 'USER': {
      out[option.name] = option.member;
      break;
    }
    case 'CHANNEL': {
      out[option.name] = option.channel;
      break;
    }
    case 'ROLE': {
      out[option.name] = option.role;
      break;
    }
    case 'BOOLEAN': {
      out[option.name] = typeof option.value === 'undefined';
      break;
    }
    case 'SUB_COMMAND':
    case 'SUB_COMMAND_GROUP': {
      if (option.options) {
        const child: any = {};
        option.options.forEach((o) => extractOption(o, child));
        out[option.name] = child;
      } else {
        out[option.name] = {};
      }
      break;
    }
    default: {
      out[option.name] = option.value;
    }
  }
}
