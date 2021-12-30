import * as A from './array';

describe(A.is_array, () => {
  it('tests if the value is an array', () => {
    expect(A.is_array([])).toBe(true);
    expect(A.is_array('hello')).toBe(false);
    expect(A.is_array(new Map().keys())).toBe(false);
    expect(A.is_array({})).toBe(false);
  });
});

describe(A.as_array, () => {
  it('wraps in an array if not already one', () => {
    expect(A.as_array([])).toEqual([]);
    expect(A.as_array([1])).toEqual([1]);
    expect(A.as_array(1)).toEqual([1]);
  });

  it('does not unroll non-array iterables', () => {
    expect(A.as_array('hello')).toEqual(['hello']);
    expect(A.as_array(new Map().keys())).toEqual([new Map().keys()]);
  });
});

describe(A.first, () => {
  it('returns the first item of an array', () => {
    expect(A.first([1, 2, 3])).toBe(1);
  });

  it('returns undefined for empty array', () => {
    expect(A.first([])).toBe(undefined);
  });
});

describe(A.last, () => {
  it('returns the last item of an array', () => {
    expect(A.last([1, 2, 3])).toBe(3);
  });

  it('returns undefined for empty array', () => {
    expect(A.last([])).toBe(undefined);
  });
});

describe(A.random, () => {
  it('returns one of the elements', () => {
    expect([1, 2, 3]).toContain(A.random([1, 2, 3]));
  });

  it('can be fed a custom rng', () => {
    const rng = () => 0.5; // chosen by fair dice roll. guaranteed to be random;
    expect(A.random([1, 2, 3], rng)).toBe(2);
  });
});

describe(A.to_sentence, () => {
  it('joins terms into a sentence', () => {
    expect(A.to_sentence(['a', 'b', 'c'])).toBe('a, b, and c');
  });

  it('uses and to join two terms', () => {
    expect(A.to_sentence(['a', 'b'])).toBe('a and b');
  });

  it('does not change a single term', () => {
    expect(A.to_sentence(['a'])).toBe('a');
  });

  it('returns an empty string for none', () => {
    expect(A.to_sentence([])).toBe('');
  });
});
