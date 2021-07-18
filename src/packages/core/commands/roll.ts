import { CommandFn, LocalCommand } from 'porygon/interaction';
import * as Dice from '../dice';

interface Opts {
  dice?: string;
}

const roll: CommandFn<Opts> = async ({ opts, embed }) => {
  const roll = Dice.parseDiceRoll(opts.dice ?? '');
  const rollNotation = Dice.unparseDiceRoll(roll);
  const results = Dice.tallyDiceRoll(roll);

  await embed.infoColor().setTitle(`Rolling ${rollNotation}...`).merge(results).reply();
};

export default new LocalCommand(roll, {
  description: 'Rolls the dice!',
  options: [
    {
      name: 'dice',
      type: 'STRING',
      required: false,
      description: 'Dice notation for the roll. Will be 1d6 if omitted.',
    },
  ],
});
