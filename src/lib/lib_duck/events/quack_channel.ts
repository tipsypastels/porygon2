import { Message, PartialMessage } from 'discord.js';
import { GuildHandler } from 'lib/lib/event';
import { setting } from 'porygon/settings';
import { eachWord } from 'support/string';

const PHRASES = setting('lib.duck.quack.phrases');
const CHANNEL_ID = setting('lib.duck.quack.channel');

const quackHandler: GuildHandler = async ({ em }) => {
  em.on('message', run).on('messageUpdate', run);
};

export default quackHandler;

function run(message: Message | PartialMessage) {
  if (isQuackChannel(message) && isInvalid(message)) {
    message.delete();
  }
}

function isQuackChannel({ channel }: Message | PartialMessage) {
  return channel.id === CHANNEL_ID.value;
}

function isInvalid({ content }: Message | PartialMessage) {
  if (!content) {
    return false;
  }

  for (const word of eachWord(content.toLowerCase())) {
    if (!PHRASES.value.includes(word)) {
      return true;
    }
  }
}
