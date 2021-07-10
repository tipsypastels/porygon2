import { randomInt } from 'mathjs';
import { CommandFn, LocalCommand } from 'porygon/interaction';

interface Opts {
  min: number;
  max: number;
}

const rand: CommandFn<Opts> = async ({ opts, embed }) => {
  const { min, max } = opts;
  const number = randomInt(min, max + 1);

  await embed
    .infoColor()
    .setAuthor(`rand(${min}..${max}) =`)
    .setTitle(number)
    .reply();
};

export default new LocalCommand(rand, {
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
