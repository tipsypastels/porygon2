import { format as formatWith } from 'date-fns';
import { Guild, Message, PartialMessage, TextChannel } from 'discord.js';
import { GuildHandler } from 'lib/lib/event';
import { PorygonEmbed } from 'porygon/embed';
import { setting } from 'porygon/settings';
import { missedPartialDeletions } from 'porygon/stats';
import { code, codeBlock } from 'support/format';

const CHANNEL_ID = setting('lib.pokecom.logging.log_channel');

const messageDeleteHandler: GuildHandler = ({ em }) => {
  em.on('messageDelete', run);
};

export default messageDeleteHandler;

function run(message: Message | PartialMessage) {
  if (message.partial) {
    missedPartialDeletions.fail();
  }

  missedPartialDeletions.succeed();

  const embed = new PorygonEmbed();

  embed
    .infoColor()
    .setAuthor(message.author!, { withDisciminator: true })
    .setTitle('Message Deleted')
    .setDescription(message.content)
    .addInlineField('Channel', message.channel.toString())
    .addInlineField('Sent at', format(message.createdAt))
    .addInlineField('Deleted at', format(new Date()))
    .addField('Message ID', codeBlock(message.id))
    .addField('User ID', codeBlock(message.author!.id));

  logChannel(message.guild!).send(embed);
}

function logChannel(guild: Guild) {
  return guild.channels.cache.get(CHANNEL_ID.value) as TextChannel;
}

function format(date: Date | null) {
  if (date) {
    return formatWith(date, code('hh:mm:ss b'));
  }
}
