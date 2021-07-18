import { Collection } from 'discord.js';
import { range } from 'support/array';
import { Asset } from './asset';

export type AssetGroupKey<G> = G extends AssetGroup<infer F> ? F[0] : never;

type File = readonly [name: any, ext: string];

export class AssetGroup<F extends File> {
  private assets = new Collection<F[0], Asset>();

  static range<E extends string>(end: number, ext: E) {
    return range(0, end).map((i) => <const>[i, ext]);
  }

  constructor(dir: string, files: readonly F[]) {
    for (const [name, ext] of files) {
      const asset = Asset.open(dir, name, ext);
      this.assets.set(name, asset);
    }
  }

  *[Symbol.iterator]() {
    for (const [, asset] of this.assets) {
      yield asset;
    }
  }

  get(key: F[0]) {
    return this.assets.get(key)!;
  }

  random() {
    return this.assets.random();
  }
}
