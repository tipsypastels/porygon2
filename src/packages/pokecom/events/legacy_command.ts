import { Message, TextChannel } from 'discord.js';
import { Embed } from 'porygon/embed';
import { logger } from 'porygon/logger';
import { EventHandler } from 'porygon/package';
import { setting } from 'porygon/settings';
import { getLegacyCommandRecommendation } from '../legacy_command_recommendation';

const SHIM_ENABLED = setting('pkg.pokecom.shim_legacy_commands');

export const legacyCommandHandler: EventHandler = ({ events }) => {
  events.on('message', handle);
};

export default legacyCommandHandler;

function handle(message: Message) {
  if (!(message.channel instanceof TextChannel) || message.author.bot) {
    return;
  }

  const command = extractCommand(message);

  if (!command) {
    return;
  }

  logger.warn(
    `${message.author.username} used legacy command !${command} in ${message.channel.name}`,
  );

  if (!SHIM_ENABLED.value) {
    return;
  }

  const rec = getLegacyCommandRecommendation(command);
  const embed = new Embed();

  embed
    .dangerColor()
    .poryThumb('speech')
    .setTitle("Porygon's command handling has changed.")
    .setDescription(
      "Porygon now uses Discord's shiny new *\\*~slash commands~\\** system. Slash commands start with a `/` and are displayed in the UI. Because of this, some old commands have been renamed or tweaked.",
    );

  if (rec) {
    embed.addField(`As for !${command}...`, rec);
  }

  return message.channel.send(embed);
}

const COMMAND = /^!(\w+)/;

function extractCommand(message: Message) {
  const match = COMMAND.exec(message.content);

  if (match) {
    return match[1].toLowerCase();
  }
}
