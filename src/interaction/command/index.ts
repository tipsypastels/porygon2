import {
  ApplicationCommandData,
  CommandInteraction,
  Guild,
  GuildMember,
  TextChannel,
} from 'discord.js';
import { Porygon } from 'porygon/client';
import { PorygonEmbed } from 'porygon/embed';

export type CommandArgs<T> = {
  client: Porygon;
  guild: Guild;
  member: GuildMember;
  channel: TextChannel;
  embed: PorygonEmbed;
  interaction: CommandInteraction;
  reply: CommandInteraction['reply'];
  opts: T;
};
export type CommandHandler<T> = (args: CommandArgs<T>) => void | Promise<void>;
export type CommandWithNoConflictName = { commandName?: string };
export type Command<T = unknown> = CommandHandler<T> &
  ApplicationCommandData &
  CommandWithNoConflictName;

export function removeCommandHandler(command: Command): ApplicationCommandData {
  return { ...command, name: command.commandName ?? command.name };
}
