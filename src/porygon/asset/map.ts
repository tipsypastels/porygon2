import { Collection } from 'discord.js';
import type { Asset } from './asset';

const MAP = new Collection<string, Asset>();

export function assetCache(asset: Asset) {
  return MAP.set(asset.path, asset);
}

export function* eachAsset() {
  for (const [, asset] of MAP) {
    yield asset;
  }
}

export function mapAssets<R>(map: (asset: Asset) => R) {
  const out: R[] = [];

  for (const [, asset] of MAP) {
    out.push(map(asset));
  }

  return out;
}
