import { Command } from 'interaction/command';
import { evaluate } from 'porygon/math';
import { codeBlock } from 'support/format';

interface Args {
  equation: string;
}

const calc: Command<Args> = async ({ opts, embed }) => {
  embed.addField('Equation', codeBlock(opts.equation));

  try {
    const result = await evaluate(opts.equation);

    embed
      .infoColor()
      .setTitle('Aaaand the answer is...')
      .addField('Result', codeBlock(result));
  } catch (error) {
    embed
      .poryThumb('math')
      .warningColor()
      .addField('Error', codeBlock(error.message))
      .setTitle(
        '_Porygon adjusts her glasses and takes another look at that equation._',
      );
  }

  await embed.reply();
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
