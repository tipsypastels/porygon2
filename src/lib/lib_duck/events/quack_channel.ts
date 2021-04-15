import { Message, PartialMessage } from 'discord.js';
import { GuildHandler } from 'lib/lib/event';
import { Setting } from 'porygon/settings';
import { eachWord } from 'support/string';

const PHRASES = new Setting('quack.phrases', ['duck', 'quack', 'bread']);
const CHANNEL_ID = new Setting('quack.channel', {
  dev: '775630182521634846',
  prod: '830569145204342794',
});

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
