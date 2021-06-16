import { Message, PartialMessage } from 'discord.js';
import { EventHandler } from 'porygon/package';
import { setting } from 'porygon/settings';
import { eachWord } from 'support/string';

const PHRASES = setting('pkg.duck.quack.phrases');
const CHANNEL_ID = setting('pkg.duck.quack.channel');

const quackHandler: EventHandler = async ({ events }) => {
  events.on('message', run).on('messageUpdate', run);
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
