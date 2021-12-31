import {
  add_command,
  ChatCommand,
  create_usage_errors,
  subsume_usage_errors,
} from 'core/command';
import { GLOBAL } from 'core/controller';
import { partial } from 'support/fn';
import { code_block, ellipsis } from 'support/string';
import { create, all } from 'mathjs';
import { from_entries } from 'support/iterator';

const truncate = partial(ellipsis, 100);

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
    subsume_usage_errors(error, (e) => {
      throw usage_error('parse_error', (<Error>e).message);
    });
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

const usage_error = create_usage_errors({
  parse_error(e, message: string) {
    e.err('warning')
      .title('_Porygon adjusts her glasses and takes another look at that equation._')
      .about(code_block(message));
  },
  called_unsafe_function_pub(e, fn: string) {
    e.err('danger')
      .title(`Unsafe function "${fn}" may not be used!`)
      .about('I see you there. Trying to break things.');
  },
});

/* -------------------------------------------------------------------------- */
/*                               Implementation                               */
/* -------------------------------------------------------------------------- */

const math = create(all);
const evaluate = math.evaluate!.bind(math);

function disabled(fn: string) {
  return () => {
    throw usage_error('called_unsafe_function_pub', fn);
  };
}

// See https://mathjs.org/docs/expressions/security.html.
const UNSAFE_FNS = [
  'import',
  'createUnit',
  'evaluate',
  'parse',
  'simplify',
  'derivative',
];

math.import!(from_entries(UNSAFE_FNS.map((f) => [f, disabled(f)])), { override: true });
