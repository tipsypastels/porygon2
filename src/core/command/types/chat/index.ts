import { Command, Args as BaseArgs, create_executor } from '../../command';
import {
  ChatInputApplicationCommandData as Data,
  CommandInteraction as Intr,
  GuildMember,
} from 'discord.js';
import { on_dm_command } from '../../direct_message';
import { noop } from 'support/fn';
import { CommandChannel, is_command_channel } from '../../channel';
import { create_status_report_middleware, slow_timing } from '../../middleware';
import { Embed } from 'core/embed';
import { Reply } from '../../reply';
import { Options } from './options';
import { Row } from 'core/command/row';

interface Args extends BaseArgs {
  channel: CommandChannel;
  intr: Intr;
  opts: Options;
}

/** A slash command used in chat. The most common command type. */
export type ChatCommand = Command<Args, Data, Intr>;
export type { Data as ChatCommandData };

const report_status = create_status_report_middleware<Args>({
  command_name({ cell }) {
    return cell.name;
  },

  command_context({ opts }) {
    return opts.serialize_options_string();
  },

  location({ channel, guild }) {
    return `${channel.name}, ${guild.name}`;
  },
});

/** An executor for slash/chat commands. */
export const execute_chat_command = create_executor<Args, Data, Intr>({
  middleware: [report_status, slow_timing],
  into_args(intr, cell) {
    const { guild, channel, member: author } = intr;
    const client = cell.client;

    if (!guild) {
      on_dm_command('command', client, intr).catch(noop);
      return 'tried_dm';
    }

    if (!is_command_channel(channel)) {
      return `invalid_channel(${channel})`;
    }

    if (!(author instanceof GuildMember)) {
      return `invalid_author(${author})`;
    }

    const row = new Row();
    const embed = new Embed();
    const reply = new Reply(intr, embed, row);
    const opts = new Options(intr.options);

    return {
      client,
      author,
      guild,
      intr,
      cell,
      channel,
      embed,
      reply,
      opts,
      row,
    };
  },
});
