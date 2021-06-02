import { chunk } from 'support/array';
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

export function chunkAssets() {
  return chunk(CHUNK_SIZE, [...MAP.values()]);
}

const CHUNK_SIZE = 10;
