import { add_command, ChatCommand } from 'core/command';
import { DUCK } from 'core/controller';
import { random } from 'support/array';
import { ellipsis } from 'support/string';

const truncate = ellipsis(300);

const eight_ball: ChatCommand = async ({ embed, opts }) => {
  const question = truncate(opts.str('question'));
  const answer = random(ANSWERS);

  embed
    .pory('8ball')
    .color('info')
    .title('The wise oracle Porygon studies her magic 8-ball.')
    .field('Question', question)
    .field('Answer', answer);
};

add_command(DUCK, eight_ball, {
  name: '8ball',
  description: 'Asks a question of the wise oracle Porygon.',
  options: [
    {
      name: 'question',
      type: 'STRING',
      required: true,
      description: 'The question you would ask the wise oracle Porygon.',
    },
  ],
});

const ANSWERS = [
  'As I see it, yes.',
  'Ask again later.',
  'Better not tell you now.',
  'Cannot predict now.',
  'Concentrate and ask again.',
  "Don't count on it.",
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
  'Yes - definitely.',
  'You may rely on it.',
];
