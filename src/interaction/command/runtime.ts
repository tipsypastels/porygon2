import { CommandInteraction, GuildMember, TextChannel } from 'discord.js';
import { InteractionBaseError } from 'interaction/errors';
import { Lib } from 'lib/lib';
import { Porygon } from 'porygon/client';
import { PorygonEmbed } from 'porygon/embed';
import { logger } from 'porygon/logger';
import { codeBlock } from 'support/format';
import { Command, effectiveCommandName } from '.';
import { createCommandOpts } from './opts';

export interface RunCommandOpts<T = undefined> {
  lib: Lib;
  client: Porygon;
  command: Command<T>;
  interaction: CommandInteraction;
}

export async function runCommand<T = undefined>({
  lib,
  client,
  command,
  interaction,
}: RunCommandOpts<T>) {
  const opts = createCommandOpts<T>(interaction);
  const reply = interaction.reply.bind(interaction);
  const embed = PorygonEmbed.fromInteraction(interaction);
  const guild = interaction.guild!;
  const member = interaction.member as GuildMember;
  const channel = interaction.channel as TextChannel;

  const args = {
    lib,
    client,
    interaction,
    opts,
    reply,
    embed,
    guild,
    member,
    channel,
  };

  await (command(args) as Promise<void>)
    .then(() => {
      logger.cmd(
        `${member.user.username} used command ${effectiveCommandName(
          command,
        )} in #${channel.name}, ${guild.name}`,
      );
    })
    .catch((e) => handleCommandError(e, embed));
}

function handleCommandError(error: any, embed: PorygonEmbed) {
  const shouldRethrow = injectErrorResponse(error, embed);
  embed.reply();
  if (shouldRethrow) throw error;
}

function injectErrorResponse(error: any, embed: PorygonEmbed) {
  switch (true) {
    case error instanceof InteractionBaseError: {
      error.intoEmbed(embed);
      return false;
    }
    case typeof error === 'object' && 'message' in error: {
      embed
        .errorColor()
        .poryThumb('error')
        .setTitle("Whoops, that's an error.")
        .setDescription(codeBlock(error.message));
      return true;
    }
    default: {
      embed
        .errorColor()
        .poryThumb('error')
        .setTitle('An unknown error occurred.');
      return true;
    }
  }
}
