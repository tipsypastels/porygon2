import {
  CommandInteraction,
  CommandInteractionOption,
  Guild,
  GuildMember,
  TextChannel,
} from 'discord.js';
import { Porygon } from 'porygon/client';
import { Embed } from 'porygon/embed';
import { logger } from 'porygon/logger';
import { catchInteractionError } from '../catch';
import { Command } from '.';

/**
 * The arguments that will be passed to a command function.
 * @template Opts The type of the command options.
 */
export interface CommandFnArgs<Opts = unknown> {
  client: Porygon;
  guild: Guild;
  author: GuildMember;
  channel: TextChannel;
  embed: Embed.Replyable;
  interaction: CommandInteraction;
  opts: Opts;
  command: Command;
}

/**
 * The commands needed to *call* a command function. `CommandFnArgs`
 * can be derived from all the arguments provided here.
 */
export interface CommandCallArgs<Opts = unknown> {
  fn: CommandFn<Opts>;
  command: Command;
  interaction: CommandInteraction;
}

/**
 * A local command function. Gets wrapped in `LocalCommand` and then in
 * `Command` on top of that.
 */
export interface CommandFn<Opts = unknown> {
  (args: CommandFnArgs<Opts>): Promise<void>;
}

/**
 * @internal
 * Calls a command function. Very low-level, not to be used directly.
 */
export function callCommandFn<Opts>(call: CommandCallArgs<Opts>) {
  const { fn, command, interaction } = call;
  const client = command.client;
  const opts = extractOptions<Opts>(interaction);
  const embed = new Embed.Replyable(interaction);
  const guild = interaction.guild!; // globals aren't supported
  const author = interaction.member as GuildMember;
  const channel = interaction.channel as TextChannel;

  const args: CommandFnArgs<Opts> = {
    client,
    guild,
    author,
    channel,
    embed,
    interaction,
    opts,
    command,
  };

  fn(args)
    .then(() => {
      logger.cmd(
        `${author.user.username} used /${command.name} in ${channel.name}, ${guild.name}`,
      );
    })
    .catch((error) => {
      catchInteractionError(error, embed);
    });
}

function extractOptions<Opts>(interaction: CommandInteraction) {
  const out: any = {};

  for (const option of interaction.options) {
    extractOption(option, out);
  }

  return out as Opts;
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
