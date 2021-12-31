import { add_command, ChatCommand } from 'core/command';
import { GLOBAL } from 'core/controller';
import { evaluate } from 'core/math';
import { code_block, ellipsis } from 'support/string';

const truncate = (x: string) => ellipsis(100, x);

const calc: ChatCommand = async ({ embed, opts }) => {
  const equation = opts.str('equation');
  const formatted_equation = code_block(truncate(equation));

  embed.field('Equation', formatted_equation);

  try {
    const result = await evaluate(equation);

    embed
      .color('info')
      .title('Aaand the answer is...')
      .field('Result', code_block(result));
  } catch (error) {
    embed
      .color('warning')
      .title('_Porygon adjusts her glasses and takes another look at that equation._')
      .field('Error', code_block((<Error>error).message));
  }
};

add_command(GLOBAL, calc, {
  name: 'calc',
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
