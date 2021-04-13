import { CommandInteraction, TextChannel } from 'discord.js';
import { InteractionBaseError } from 'interaction/errors';
import { Porygon } from 'porygon/client';
import { PorygonEmbed } from 'porygon/embed';
import { codeBlock } from 'support/format';
import { Command } from '.';
import { createCommandOpts } from './opts';

export interface RunCommandOpts<T = undefined> {
  client: Porygon;
  command: Command<T>;
  interaction: CommandInteraction;
}

export async function runCommand<T = undefined>({
  client,
  command,
  interaction,
}: RunCommandOpts<T>) {
  const opts = createCommandOpts<T>(interaction);
  const reply = interaction.reply.bind(interaction);
  const embed = new PorygonEmbed(reply);
  const args = {
    client,
    interaction,
    opts,
    reply,
    embed,
    guild: interaction.guild!,
    member: interaction.member!,
    channel: interaction.channel as TextChannel,
  };

  await (command(args) as Promise<void>)
    .then(() => {
      //
    })
    .catch((e) => handleCommandError(e, embed));
}

function handleCommandError(error: any, embed: PorygonEmbed) {
  return createErrorResponse(error, embed).reply();
}

function createErrorResponse(error: any, embed: PorygonEmbed) {
  switch (true) {
    case error instanceof InteractionBaseError: {
      return error.intoEmbed(embed);
    }
    case typeof error === 'object' && 'message' in error: {
      return embed
        .errorColor()
        .setTitle("Whoops, that's an error.")
        .setDescription(codeBlock(error.message));
    }
    default: {
      return embed.errorColor().setTitle('An unknown error occurred.');
    }
  }
}
