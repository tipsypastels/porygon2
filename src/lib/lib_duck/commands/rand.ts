import { Command } from 'interaction/command';
import { randomInt } from 'mathjs';

interface Opts {
  min: number;
  max: number;
}

const rand: Command<Opts> = async ({ opts, embed }) => {
  const { min, max } = opts;
  const number = randomInt(min, max + 1);

  await embed
    .infoColor()
    .setAuthor(`rand(${min}..${max}) =`)
    .setTitle(number)
    .reply();
};

rand.description = 'Picks a random number between min and max.';
rand.options = [
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
];

export default rand;
