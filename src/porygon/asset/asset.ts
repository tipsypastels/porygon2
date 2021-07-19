import { createLang } from 'porygon/lang';
import { assetCache } from './map';
import { assetSetupIsDone } from './setup';

export type AssetName = string | number;

export class Asset {
  private _url = '';

  constructor(readonly dir: string, readonly name: AssetName, readonly ext: string) {
    if (assetSetupIsDone()) {
      throw new Error(lang('dynamic_create'));
    }

    assetCache(this);
  }

  get path() {
    return `./assets/${this.dir}/${this.name}.${this.ext}`;
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
