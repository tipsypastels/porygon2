import { AssetGroup } from './asset';

export const COIN_ASSETS = new AssetGroup('coins', <const>[
  ['heads', 'png'],
  ['tails', 'png'],
]);

export const PORY_ASSETS = new AssetGroup('pory', <const>[
  ['8ball', 'png'],
  ['angry', 'png'],
  ['danger', 'png'],
  ['error', 'png'],
  ['plead', 'png'],
  ['smile', 'png'],
  ['speech', 'png'],
  ['thanos', 'png'],
  ['vibe', 'png'],
  ['warning', 'png'],
]);

export const HANGMAN_ASSETS = new AssetGroup('hangman', AssetGroup.range(10, 'png'));
export const HEADPAT_ASSETS = new AssetGroup('headpats', AssetGroup.range(33, 'gif'));
