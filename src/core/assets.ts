import { add_asset_group, add_asset_range } from './asset';

export const PORY_ASSETS = add_asset_group('pory', <const>[
  '8ball',
  'angry',
  'danger',
  'error',
  'plead',
  'smile',
  'speech',
  'thanos',
  'vibe',
  'warning',
]);

export const COIN_ASSETS = add_asset_group('coins', <const>['heads', 'tails']);
export const HANGMAN_ASSETS = add_asset_range('hangman', 10);
export const HEADPAT_ASSETS = add_asset_range('headpats', 33, 'gif');
