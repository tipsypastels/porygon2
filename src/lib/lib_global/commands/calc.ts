import { Command } from 'interaction/command';
import { evaluate } from 'porygon/math';
import { codeBlock } from 'support/format';

interface Args {
  equation: string;
}

const calc: Command<Args> = async ({ args, embed, reply }) => {
  try {
    const result = await evaluate(args.equation);

    embed
      .infoColor()
      .setTitle('Aaaand the answer is...')
      .setDescription(codeBlock(result));
  } catch (error) {
    embed
      .poryPortrait()
      .warningColor()
      .setDescription(codeBlock(error.message))
      .setTitle(
        '_Porygon adjusts her glasses and takes another look at that equation._',
      );
  }

  reply(embed);
};

calc.description = 'Does your math homework.';
calc.options = [
  {
    name: 'equation',
    type: 'STRING',
    required: true,
    description: 'An equation to evaluate.',
  },
];

export default calc;
