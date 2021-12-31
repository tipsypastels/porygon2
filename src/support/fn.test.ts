import * as F from './fn';

describe(F.is_function, () => {
  it('tests whether a value is a function', () => {
    for (const value of [[], {}, 1, 'a', Symbol(), true]) {
      expect(F.is_function(value)).toBe(false);
    }

    expect(F.is_function(F.noop)).toBe(true);
  });
});

describe(F.into_resolved, () => {
  it('resolves a value that may or may not be a function', () => {
    expect(F.into_resolved(5)).toBe(5);
    expect(F.into_resolved(() => 5)).toBe(5);
  });

  it('can take parameters', () => {
    expect(F.into_resolved((n: number) => n + 1, 1)).toBe(2);
  });
});

describe(F.identity, () => {
  it('returns the value unchanged', () => {
    const sym = Symbol();
    expect(F.identity(sym)).toBe(sym);
  });
});

describe(F.noop, () => {
  it('does nothing and returns undefined', () => {
    expect(F.noop()).toBeUndefined();
  });

  it('ignores input', () => {
    // @ts-expect-error Because we're passing in a value explicitly.
    expect(F.noop(5)).toBeUndefined();
  });
});

describe(F.tap, () => {
  it('performs a side effect', () => {
    const val = 25;
    let mut = 1;

    expect(F.tap((v) => (mut += v), val)).toBe(val);
    expect(mut).toBe(26);
  });
});

describe(F.partial, () => {
  const add = (a: number, b: number) => a + b;

  it('performs partial application', () => {
    const add2 = F.partial(add, 1);
    expect(add2(2)).toBe(3);
  });

  it('can partially apply all parameters', () => {
    const add2 = F.partial(add, 1, 2);
    expect(add2()).toBe(3);
  });

  it('does not affect the input if no parameters are passed', () => {
    const add2 = F.partial(add);
    expect(add2(1, 2)).toBe(3);
  });

  it('ignores excess on the partial call', () => {
    // @ts-expect-error Because we're passing an extra parameter.
    const add2 = F.partial(add, 1, 2, 3);
    expect(add2()).toBe(3);
  });

  it('ignores excess on the call to the returned function', () => {
    const add2 = F.partial(add, 1, 2);
    // @ts-expect-error Because we're passing a parameter.
    expect(add2(5)).toBe(3);
  });
});
