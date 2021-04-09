import { Command } from 'interaction/command';
import { Markov } from 'porygon/markov';
import { codeBlock } from 'support/format';

const PORY_AI = new Markov({
  name: 'pory',
  fallback: 'hi im pory',
});

interface Args {
  prompt?: string;
}

const pory: Command<Args> = ({ args, reply, embed, member, guild, client }) => {
  const { prompt } = args;
  const response = PORY_AI.speak();
  const bot = guild.members.cache.get(client.user!.id)!;

  embed.infoColor().setTitle('Porygon Talk Show');

  if (prompt) {
    embed.addField(member.displayName, codeBlock(prompt));
  }

  embed.addField(bot.displayName, codeBlock(response));

  reply(embed);

  // slow, run after reply
  if (prompt) {
    PORY_AI.learn(prompt);
  }
};

pory.description =
  'Speaks to Porygon. Providing an optional message will allow it to be mixed in to future sentences.';
pory.options = [
  {
    name: 'prompt',
    type: 'STRING',
    required: false,
    description: 'The message to feed to Pory for future sentences.',
  },
];

export default pory;
