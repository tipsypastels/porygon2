import { Command } from 'porygon/interaction';
import { randomInt } from 'mathjs';

interface Opts {
  min: number;
  max: number;
}

const rand: Command.Fn<Opts> = async ({ opts, embed }) => {
  const { min, max } = opts;
  const number = randomInt(min, max + 1);

  await embed
    .infoColor()
    .setAuthor(`rand(${min}..${max}) =`)
    .setTitle(number)
    .reply();
};

export default new Command(rand, {
  description: 'Picks a random number between min and max.',
  options: [
    {
      name: 'min',
      description: 'The minimum number.',
      type: 'INTEGER',
      required: true,
    },
    {
      name: 'max',
      description: 'The maximum number.',
      type: 'INTEGER',
      required: true,
    },
  ],
});
