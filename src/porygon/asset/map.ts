import type { Asset } from './index';

const MAP = new Map<string, Asset>();

export function assetGet(path: string) {
  return MAP.get(path);
}

export function assetCache(asset: Asset) {
  return MAP.set(asset.path, asset);
}

export function mapAssets<R>(map: (asset: Asset) => R) {
  const out: R[] = [];

  for (const [, asset] of MAP) {
    out.push(map(asset));
  }

  return out;
}
