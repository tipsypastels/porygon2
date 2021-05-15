import { create, all } from 'mathjs';
import { mapToObjectWithKeys } from 'support/object';

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

math.import!(mapToObjectWithKeys(UNSAFE_FNS, disabled), {
  override: true,
});
