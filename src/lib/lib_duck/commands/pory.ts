import { Command } from 'interaction/command';
import { Markov } from 'porygon/markov';

const PORY_AI = new Markov({
  name: 'pory',
  fallback: 'hi im pory',
});

interface Args {
  prompt?: string;
}

const pory: Command<Args> = ({ args, reply }) => {
  const response = PORY_AI.speak();

  reply(response);

  if (args.prompt) {
    PORY_AI.learn(args.prompt);
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