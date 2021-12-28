import { Registrar } from 'core/registrar';
import { Client, Collection } from 'discord.js';
import { eager, inclusive_range, map } from 'support/iterator';
import { Asset } from './asset';
import { sync_assets } from './sync';

type File<K extends string> = K | [name: K, ext: string];
type Files<K extends string> = readonly File<K>[];

export type AssetsKey<R> = R extends AssetRegistrar<infer K> ? K : never;

class AssetRegistrar<K extends string> extends Registrar {
  private assets = new Collection<K, Asset>();

  constructor(private dir: string, files: Files<K>) {
    super(`assets_${dir}`);

    for (const file of files) {
      const asset = new Asset(dir, file);
      this.assets.set(asset.name as K, asset);
    }
  }

  synchronize(client: Client) {
    return sync_assets(client, this.dir, this.assets);
  }

  *[Symbol.iterator]() {
    for (const [, asset] of this.assets) {
      yield asset;
    }
  }

  get(key: K) {
    return this.assets.get(key)!;
  }

  random() {
    return this.assets.random()!;
  }
}

export type { AssetRegistrar };

export function add_asset_group<K extends string>(dir: string, files: Files<K>) {
  return new AssetRegistrar(dir, files);
}

export function add_asset_range(dir: string, end: number, ext = 'png') {
  const files = eager(map((n) => <File<string>>[`${n}`, ext], inclusive_range(0, end)));
  return add_asset_group(dir, files);
}
