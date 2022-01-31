import { try_tidy_fc as tidy } from './tidy';

describe(tidy, () => {
  describe('reformatting', () => {
    it('returns correct codes unchanged', () => {
      const code = '1111-2222-3333';
      expect(tidy(code)).toBe(code);
    });

    it('replaces spaces with dashes', () => {
      const code = '1111 2222 3333';
      expect(tidy(code)).toBe(code.replaceAll(' ', '-'));
    });

    it('replaces missing separators with dashes', () => {
      const code = '111122223333';
      expect(tidy(code)).toBe('1111-2222-3333');
    });
  });

  describe('validation errors', () => {
    it('fails if the wrong number of sections are given', () => {
      expect(tidy('1111')).toBeUndefined();
      expect(tidy('1111-2222')).toBeUndefined();
      expect(tidy('1111-2222-3333-4444')).toBeUndefined();
    });

    it('fails if sections have the wrong length', () => {
      expect(tidy('111-222-333')).toBeUndefined();
    });

    it('fails on insane data', () => {
      expect(tidy('hello, world!')).toBeUndefined();
    });
  });
});
