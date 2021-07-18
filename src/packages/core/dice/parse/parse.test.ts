import { parseDiceRoll as parse, DEFAULT_DICE_ROLL } from '..';

describe(parse, () => {
  it('returns the default case for an empty string', () => {
    expect(parse('')).toEqual(DEFAULT_DICE_ROLL);
  });

  it('returns the default case for a blank non-empty string', () => {
    expect(parse(' ')).toEqual(DEFAULT_DICE_ROLL);
  });

  it('parses a bare number as the number of dice', () => {
    expect(parse('2')).toEqual({ count: 2, faces: 6 });
  });

  it('parses {x}d{y] as {count}d{faces}', () => {
    expect(parse('2d4')).toEqual({ count: 2, faces: 4 });
  });

  it('supports faces without count', () => {
    expect(parse('d4')).toEqual({ count: 1, faces: 4 });
  });

  it('ignores spaces altogether', () => {
    expect(parse('2   d   4')).toEqual({ count: 2, faces: 4 });
  });

  it('supports positive offsets', () => {
    expect(parse('2d4+6')).toEqual({ count: 2, faces: 4, offset: 6 });
  });

  it('supports negative offsets', () => {
    expect(parse('2d4-6')).toEqual({ count: 2, faces: 4, offset: -6 });
  });

  it('supports offsets without faces', () => {
    expect(parse('2+4')).toEqual({ count: 2, faces: 6, offset: 4 });
  });

  it('supports offsets alone', () => {
    expect(parse('+4')).toEqual({ count: 1, faces: 6, offset: 4 });
  });

  for (const op of ['=', '>', '<', '>=', '<=']) {
    it(`supports op ${op}`, () => {
      expect(parse(`1d4${op}5`)).toEqual({
        count: 1,
        faces: 4,
        threshold: { op, value: 5 },
      });
    });
  }

  it('supports ops alone', () => {
    expect(parse('=5')).toEqual({ count: 1, faces: 6, threshold: { op: '=', value: 5 } });
  });
});
