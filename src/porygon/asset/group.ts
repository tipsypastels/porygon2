import { random } from 'support/array';
import { Asset } from '.';

export type AssetGroupKey<G> = G extends AssetGroup<infer K> ? K : never;

export class AssetGroup<K extends PropertyKey> {
  readonly keys: K[] = [];
  private assets: Record<K, Asset>;

  constructor(dir: string, files: Record<K, string>) {
    const assets: Partial<Record<K, Asset>> = {};
    let key: K;

    for (key in files) {
      this.keys.push(key);

      assets[key] = Asset.open(dir, files[key]);
    }

    this.assets = assets as Record<K, Asset>;
  }

  get(key: K) {
    return this.assets[key];
  }

  random() {
    const key = random(this.keys);
    return this.assets[key];
  }
}
