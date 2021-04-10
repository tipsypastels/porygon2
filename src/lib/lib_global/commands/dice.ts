import { Command } from 'interaction/command';
import { DiceRoll, DiceRollOpts } from '../models/dice_roll';

const dice: Command<DiceRollOpts> = ({ args, reply, embed }) => {
  const roll = new DiceRoll(args);

  embed.okColor().setTitle('Dice Roll');
  roll.intoEmbed(embed);

  reply(embed);
};

dice.description = 'Rolls the dice.';
dice.options = [
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
];

export default dice;
