import { Markov } from '../markov';
import { codeBlock } from 'support/format';
import { CommandFn, LocalCommand } from 'porygon/interaction';

const PORY_AI = new Markov({
  name: 'pory',
  fallback: 'hi im pory',
});

interface Opts {
  prompt?: string;
}

const pory: CommandFn<Opts> = async ({
  opts,
  embed,
  author,
  guild,
  client,
}) => {
  const { prompt } = opts;
  const response = PORY_AI.speak();
  const bot = guild.members.cache.get(client.user!.id)!;

  embed.infoColor().setTitle('Porygon Talk Show');

  if (prompt) {
    embed.addField(author.displayName, codeBlock(prompt));
  }

  await embed.addField(bot.displayName, codeBlock(response)).reply();

  // slow, run after reply
  if (prompt) {
    PORY_AI.learn(prompt);
  }
};

export default new LocalCommand(pory, {
  description:
    'Speaks to Porygon. Providing an optional message will allow it to be mixed in to future sentences.',
  options: [
    {
      name: 'prompt',
      type: 'STRING',
      required: false,
      description: 'The message to feed to Pory for future sentences.',
    },
  ],
});
