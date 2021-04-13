import { CommandInteraction, CommandInteractionOption } from 'discord.js';

export function createCommandOpts<T>(interaction: CommandInteraction) {
  const out: any = {};

  for (const option of interaction.options) {
    transform(option, out);
  }

  return out as T;
}

function transform(option: CommandInteractionOption, out: any = {}) {
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
    case 'SUB_COMMAND':
    case 'SUB_COMMAND_GROUP': {
      if (option.options) {
        const child: any = {};
        option.options!.forEach((o) => transform(o, child));
        out[option.name] = child;
      } else {
        out[option.name] = undefined; // required for disambiguate to work
      }
      break;
    }
    default: {
      out[option.name] = option.value;
    }
  }

  return out;
}
