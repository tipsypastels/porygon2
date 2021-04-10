import { Message, PartialMessage } from 'discord.js';
import { GuildHandler } from 'lib/lib_event_manager';
import { Setting } from 'porygon/settings';

const PHRASES = new Setting('quack.phrases', ['duck', 'quack', 'bread']);
const CHANNEL_ID = new Setting('quack.channel', {
  dev: '775630182521634846',
  prod: '0',
});

const quackHandler: GuildHandler = async ({ em }) => {
  em.on('message', async (message) => {
    if (message.channel.id === CHANNEL_ID.value) {
      deleteIfInvalid(message);
    }
  });

  em.on('messageUpdate', async (message) => {
    if (message.channel.id === CHANNEL_ID.value) {
      deleteIfInvalid(message);
    }
  });
};

export default quackHandler;

function deleteIfInvalid(message: Message | PartialMessage) {
  const content = message.content?.toLowerCase();
  const valid = PHRASES.value.some((phrase) => content === phrase);

  if (!valid) {
    message.delete();
  }
}
