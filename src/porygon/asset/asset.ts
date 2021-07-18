import { createLang } from 'porygon/lang';
import { assetCache, assetGet } from './map';
import { assetSetupIsDone } from './setup';

export class Asset {
  private _url = '';

  static open(dir: string, name: string, ext: string) {
    if (assetSetupIsDone()) {
      throw new Error(lang('dynamic_create'));
    }

    const path = this.path(dir, name, ext);
    return assetGet(path) ?? new Asset(dir, name, ext);
  }

  static path(dir: string, name: string, ext: string) {
    return `./assets/${dir}/${name}.${ext}`;
  }

  private constructor(readonly dir: string, readonly name: string, readonly ext: string) {
    assetCache(this);
  }

  get path() {
    return Asset.path(this.dir, this.name, this.ext);
  }

  get url() {
    return this._url;
  }

  set url(url) {
    if (assetSetupIsDone()) {
      throw new Error(lang('dynamic_set_url'));
    }

    this._url = url;
  }
}

const lang = createLang(<const>{
  dynamic_create:
    "Can't create assets dynamically. All assets must be created during setup.",
  dynamic_set_url:
    "Can't set asset URLs dynamically! All URLs must be fixed during setup.",
});

// export class Asset {
//   static group<K>(dir: string, files: readonly [K, string][]) {
//     return new AssetGroup(dir, files);
//   }

//   static numberedGroup(dir: string, map: (index: number) => string) {
//     const filesCount = getAssetFilesCountInDir(this.path(dir, ''));
//     const inputRange = range(0, filesCount - 1).map(
//       (i) => [i, map(i)] as [number, string],
//     );

//     return this.group(dir, inputRange);
//   }

//   static open(dir: string, file: string) {
//     if (assetSetupIsDone()) {
//       throw new Error(
//         "Can't create new assets dynamically, all assets must be created before the synchronization step.",
//       );
//     }

//     const path = this.path(dir, file);
//     return assetGet(path) ?? new Asset(dir, file);
//   }

//   protected static path(dir: string, file: string) {
//     return `./assets/${dir}/${file}`;
//   }

//   private _url = '';

//   private constructor(readonly dir: string, readonly file: string) {
//     assetCache(this);
//   }

//   get path() {
//     return Asset.path(this.dir, this.file);
//   }

//   get url() {
//     return this._url;
//   }

//   set url(url) {
//     if (assetSetupIsDone()) {
//       throw new Error(
//         "Can't set asset url dynamically, all asset urls must be set during synchronization step.",
//       );
//     }

//     this._url = url;
//   }
// }

// export function extension(ext: string) {
//   return <K>(key: K) => `${key}.${ext}`;
// }

// const ASSET_EXTENSIONS = /\.(gif|jpg|jpeg|png)$/;

// function getAssetFilesCountInDir(dir: string) {
//   return readdirSync(dir).filter((f) => f.match(ASSET_EXTENSIONS)).length;
// }
