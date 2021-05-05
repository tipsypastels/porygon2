import { assetCache, assetGet } from './map';
import { assetSetupIsDone } from './setup';

export type AssetGroup<K extends PropertyKey> = Record<K, Asset>;

export class Asset {
  static group<K extends PropertyKey>(dir: string, files: Record<K, string>) {
    const group: Partial<AssetGroup<K>> = {};
    let key: K;

    for (key in files) {
      group[key] = this.open(dir, files[key]);
    }

    return group as AssetGroup<K>;
  }

  static open(dir: string, file: string) {
    if (assetSetupIsDone()) {
      throw new Error(
        "Can't create new assets dynamically, all assets must be created before the synchronization step.",
      );
    }

    const path = this.path(dir, file);
    return assetGet(path) ?? new Asset(dir, file);
  }

  protected static path(dir: string, file: string) {
    return `./assets/${dir}/${file}`;
  }

  private _url = '';

  private constructor(readonly dir: string, readonly file: string) {
    assetCache(this);
  }

  get path() {
    return Asset.path(this.dir, this.file);
  }

  get url() {
    return this._url;
  }

  set url(url) {
    if (assetSetupIsDone()) {
      throw new Error(
        "Can't set asset url dynamically, all asset urls must be set during synchronization step.",
      );
    }

    this._url = url;
  }
}
