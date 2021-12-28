import { first, last, to_sentence } from './array';

describe(first, () => {
  it('returns the first item of an array', () => {
    expect(first([1, 2, 3])).toBe(1);
  });

  it('returns undefined for empty array', () => {
    expect(first([])).toBe(undefined);
  });
});

describe(last, () => {
  it('returns the last item of an array', () => {
    expect(last([1, 2, 3])).toBe(3);
  });

  it('returns undefined for empty array', () => {
    expect(last([])).toBe(undefined);
  });
});

describe(to_sentence, () => {
  it('joins terms into a sentence', () => {
    expect(to_sentence(['a', 'b', 'c'])).toBe('a, b, and c');
  });

  it('uses and to join two terms', () => {
    expect(to_sentence(['a', 'b'])).toBe('a and b');
  });

  it('does not change a single term', () => {
    expect(to_sentence(['a'])).toBe('a');
  });

  it('returns an empty string for none', () => {
    expect(to_sentence([])).toBe('');
  });
});
