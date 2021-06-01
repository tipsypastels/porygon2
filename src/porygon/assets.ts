import { range } from 'support/array';
import { mapToObjectWithKeys } from 'support/object';
import { Asset, extension } from './asset/index';

export const COIN_ASSETS = Asset.group('coins', {
  heads: 'heads.png',
  tails: 'tails.png',
});

export const PORY_ASSETS = Asset.group('pory', {
  '8ball': '8ball.png',
  'angry': 'angry.png',
  'danger': 'danger.png',
  'death': 'death.png',
  'error': 'error.png',
  'math': 'math.gif',
  'plead': 'plead.png',
  'smile': 'smile.png',
  'speech': 'speech.png',
  'thanos': 'thanos.png',
  'warning': 'warning.png',
});

export const HANGMAN_ASSETS = Asset.numberedGroup('hangman', extension('png'));
// export const HEADPAT_ASSETS = Asset.numberedGroup('headpats', extension('gif'));
export const HEADPAT_ASSETS = Asset.group(
  'headpats',
  mapToObjectWithKeys(range(0, 10), (n) => `${n}.gif`),
);
