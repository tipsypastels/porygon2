import { CommandInteraction, TextChannel } from 'discord.js';
import { Porygon } from 'porygon/client';
import { PorygonEmbed } from 'porygon/embed';
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

  await command({
    client,
    interaction,
    opts,
    reply,
    guild: interaction.guild!,
    member: interaction.member!,
    channel: interaction.channel as TextChannel,
    embed: new PorygonEmbed(reply),
  });
}
