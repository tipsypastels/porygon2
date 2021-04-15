import { Command } from 'interaction/command';
import { random } from 'support/array';

interface Args {
  question: string;
}

const eightBall: Command<Args> = async ({ embed, opts }) => {
  const line = random(LINES);

  await embed
    .infoColor()
    .poryThumb('8ball')
    .setTitle('The wise oracle Porygon studies her magic 8-ball.')
    .addField('Question', opts.question)
    .addField('Answer', line)
    .reply();
};

eightBall.commandName = '8ball';
eightBall.description = 'Asks a question of the wise oracle Porygon.';
eightBall.options = [
  {
    name: 'question',
    type: 'STRING',
    required: true,
    description: 'The question you would ask the wise oracle Porygon.',
  },
];

export default eightBall;

const LINES = [
  'As I see it, yes.',
  'Ask again later.',
  'Better not tell you now.',
  'Cannot predict now.',
  'Concentrate and ask again.',
  'Don’t count on it.',
  'It is certain.',
  'It is decidedly so.',
  'Most likely.',
  'My reply is no.',
  'My sources say no.',
  'Outlook not so good.',
  'Outlook good.',
  'Reply hazy, try again.',
  'Signs point to yes.',
  'Very doubtful.',
  'Without a doubt.',
  'Yes.',
  'Yes – definitely.',
  'You may rely on it.',
];
