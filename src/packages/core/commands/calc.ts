import { Command } from 'porygon/interaction/command';
import { evaluate } from 'porygon/math';
import { codeBlock } from 'support/format';

interface Opts {
  equation: string;
}

const calc: Command.Fn<Opts> = async ({ opts, embed }) => {
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

export default new Command(calc, {
  description: 'Does your math homework.',
  options: [
    {
      name: 'equation',
      type: 'STRING',
      required: true,
      description: 'An equation to evaluate.',
    },
  ],
});
