import { ApplicationCommandData, CommandInteraction } from 'discord.js';
import { PorygonClient } from 'porygon/client';
import { PorygonEmbed } from 'porygon/embed';

export type CommandArgs<T> = {
  client: PorygonClient;
  embed: PorygonEmbed;
  interaction: CommandInteraction;
  args: T;
};
export type CommandHandler<T> = (args: CommandArgs<T>) => void | Promise<void>;
export type Command<T = unknown> = CommandHandler<T> & ApplicationCommandData;

export function removeCommandHandler(command: Command): ApplicationCommandData {
  return { ...command, name: command.name };
}
