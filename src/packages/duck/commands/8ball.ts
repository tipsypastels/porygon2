import { Command } from 'porygon/interaction/command';
import { setting } from 'porygon/settings';
import { random } from 'support/array';

interface Opts {
  question: string;
}

const LINES = setting('pkg.duck.8ball.lines');

const eightBall: Command.Fn<Opts> = async ({ embed, opts }) => {
  const line = random(LINES.value);

  await embed
    .infoColor()
    .poryThumb('8ball')
    .setTitle('The wise oracle Porygon studies her magic 8-ball.')
    .addField('Question', opts.question)
    .addField('Answer', line)
    .reply();
};

export default new Command(eightBall, {
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
