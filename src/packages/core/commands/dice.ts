import { CommandFn, LocalCommand } from 'porygon/interaction';
import { DiceRoll, DiceRollOpts } from '../dice_roll';

const dice: CommandFn<DiceRollOpts> = async ({ opts, embed }) => {
  const roll = new DiceRoll(opts);
  await embed.okColor().setTitle('Dice Roll').merge(roll).reply();
};

export default new LocalCommand(dice, {
  description: 'Rolls the dice.',
  options: [
    {
      name: 'faces',
      type: 'INTEGER',
      required: false,
      description: 'The number of faces per die rolled. 6 by default.',
    },
    {
      name: 'count',
      type: 'INTEGER',
      required: false,
      description: 'The amount of dice to roll. 1 by default.',
    },
    {
      name: 'offset',
      type: 'INTEGER',
      required: false,
      description: 'If provided, this amount will be added to all rolls.',
    },
  ],
});
