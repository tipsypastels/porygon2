import { CommandInteraction } from 'discord.js';

export function createCommandArgs<T>(interaction: CommandInteraction) {
  const out: any = {};

  for (const option of interaction.options) {
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
      default: {
        out[option.name] = option.value;
      }
    }
  }

  return out as T;
}
