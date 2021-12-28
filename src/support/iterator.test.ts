import {
  eager,
  zip,
  skip,
  take_while,
  inclusive_range as ir,
  exclusive_range as er,
} from './iterator';

function is_done(iter: Iterable<any>) {
  return iter[Symbol.iterator]().next().done;
}

describe(zip, () => {
  it('never yields for empty iterables', () => {
    expect(is_done(zip([], []))).toBe(true);
  });

  it('never yields if either iterator is empty', () => {
    expect(is_done(zip([1], []))).toBe(true);
    expect(is_done(zip([], [1]))).toBe(true);
  });

  it('yields tuples of its arguments', () => {
    expect(eager(zip([1, 2, 3], ['a', 'b', 'c']))).toEqual([
      [1, 'a'],
      [2, 'b'],
      [3, 'c'],
    ]);
  });
});

describe(skip, () => {
  it('skips items of an iterator', () => {
    expect(eager(skip(1, [1, 2, 3]))).toEqual([2, 3]);
  });

  it('skips everything if greater than the total', () => {
    expect(eager(skip(5, [1, 2, 3]))).toEqual([]);
  });

  it('skips nothing if zero', () => {
    expect(eager(skip(0, [1, 2, 3]))).toEqual([1, 2, 3]);
  });

  it('does not affect an empty iterator', () => {
    expect(eager(skip(1, []))).toEqual([]);
  });
});

describe(take_while, () => {
  it('stops once the given predicate becomes false', () => {
    expect(eager(take_while((a) => a <= 3, [1, 2, 3, 4, 5]))).toEqual([1, 2, 3]);
  });
});

describe(ir, () => {
  it('yields from (a, b]', () => {
    expect(eager(ir(1, 5))).toEqual([1, 2, 3, 4, 5]);
  });

  it('does not support backwards ranges', () => {
    expect(() => eager(ir(5, 1))).toThrowError('Negative range!');
  });
});

describe(er, () => {
  it('yields from (a, b)', () => {
    expect(eager(er(1, 5))).toEqual([1, 2, 3, 4]);
  });

  it('does not support backwards ranges', () => {
    expect(() => eager(er(5, 1))).toThrowError('Negative range!');
  });
});
