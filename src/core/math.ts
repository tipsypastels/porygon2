import { create, all } from 'mathjs';
import { from_entries } from 'support/iterator';

const math = create(all);
export const evaluate = math.evaluate!.bind(math);

function disabled(fn: string) {
  return () => {
    throw new Error(`Function ${fn} is diabled.`);
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
