import { CommandInteraction } from 'discord.js';
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

  await command({
    client,
    interaction,
    opts,
    reply: interaction.reply.bind(interaction),
    guild: interaction.guild!,
    member: interaction.member!,
    embed: new PorygonEmbed(),
  });
}
