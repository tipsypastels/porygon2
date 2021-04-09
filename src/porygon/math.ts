import fromEntries from 'object.fromentries';
import { create, all } from 'mathjs';

const math = create(all);
export const evaluate = math.evaluate!;

/**
 * @see https://mathjs.org/docs/expressions/security.html
 */

const UNSAFE_FNS = [
  'import',
  'createUnit',
  'evaluate',
  'parse',
  'simplify',
  'derivative',
];

function disabled(fn: string) {
  return () => {
    throw new Error(`Function ${fn} is disabled`);
  };
}

math.import!(fromEntries(UNSAFE_FNS.map((f) => [f, disabled(f)])), {
  override: true,
});
