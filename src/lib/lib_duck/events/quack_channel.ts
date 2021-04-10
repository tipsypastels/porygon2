import { Message, PartialMessage } from 'discord.js';
import { GuildHandler } from 'lib/lib_event_manager';
import { setting } from 'porygon/settings';

const getPhrases = setting('quack.phrases', ['duck']);
const getChannelId = setting('quack.channel_id', {
  dev: '775630182521634846',
  prod: '0',
});

const quackHandler: GuildHandler = async ({ em }) => {
  em.on('message', async (message) => {
    const [phrases, channelId] = await lazyFetchSettings();

    if (message.channel.id === channelId) {
      deleteIfInvalid(message, phrases);
    }
  });

  em.on('messageUpdate', async (message) => {
    const [phrases, channelId] = await lazyFetchSettings();

    if (message.channel.id === channelId) {
      deleteIfInvalid(message, phrases);
    }
  });
};

export default quackHandler;

function deleteIfInvalid(message: Message | PartialMessage, phrases: string[]) {
  const content = message.content?.toLowerCase();
  const valid = phrases.some((phrase) => content === phrase);

  if (!valid) {
    message.delete();
  }
}

// we want to fetch them every time so updates via /settings set take effect
async function lazyFetchSettings() {
  return [await getPhrases(), await getChannelId()] as const;
}
