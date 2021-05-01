import {
  ApplicationCommandData,
  CommandInteraction,
  Guild,
  GuildMember,
  TextChannel,
} from 'discord.js';
import { Lib } from 'lib/lib';
import { Porygon } from 'porygon/client';
import { PorygonEmbed } from 'porygon/embed';

export type CommandArgs<T> = {
  client: Porygon;
  guild: Guild;
  member: GuildMember;
  channel: TextChannel;
  embed: PorygonEmbed;
  interaction: CommandInteraction;
  opts: T;
  lib: Lib;
};
export type CommandHandler<T> = (args: CommandArgs<T>) => Promise<void>;
export type CommandWithNoConflictName = { commandName?: string };
export type Command<T = unknown> = CommandHandler<T> &
  ApplicationCommandData &
  CommandWithNoConflictName;

export function removeCommandHandler(command: Command): ApplicationCommandData {
  return { ...command, name: effectiveCommandName(command) };
}

export function effectiveCommandName(command: Command<any>) {
  return command.commandName ?? command.name;
}
