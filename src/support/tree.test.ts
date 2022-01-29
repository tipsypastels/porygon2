import { render_tree as tree } from './tree';

interface Node<T> {
  value: T;
  children?: Node<T>[];
}

type Pair<T> = [T, Pair<T>[]?];

function from_pair<T>([value, children]: Pair<T>): Node<T> {
  if (!children) return { value };
  return { value, children: children.map(from_pair) };
}

describe('test helper pair', () => {
  it('works', () => {
    const pair: Pair<string> = ['a', [['b'], ['c', [['d']]]]];
    expect(from_pair(pair)).toEqual({
      value: 'a',
      children: [{ value: 'b' }, { value: 'c', children: [{ value: 'd' }] }],
    });
  });
});
