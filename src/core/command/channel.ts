import { TextChannel, ThreadChannel } from 'discord.js';

export type CommandChannel = TextChannel | ThreadChannel;

export function is_command_channel(ch: unknown): ch is CommandChannel {
  return !!ch && (ch instanceof TextChannel || ch instanceof ThreadChannel);
}
