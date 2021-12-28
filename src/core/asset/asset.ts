import { panic } from 'core/logger';
import { Registrar } from 'core/registrar';
import { is_array } from 'support/type';

const DEFAULT_EXT = 'png';
type File = string | [name: string, ext: string];

export class Asset {
  readonly name: string;
  readonly ext: string;

  private _url = '';

  constructor(readonly dir: string, file: File) {
    const [name, ext] = is_array(file) ? file : [file, DEFAULT_EXT];
    this.name = name;
    this.ext = ext;
  }

  get path() {
    return `./assets/${this.dir}/${this.name}.${this.ext}`;
  }

  get url() {
    return this._url;
  }

  set url(url: string) {
    this.test_syncing("Can't set an asset URL after synchronization!");
    this._url = url;
  }

  private test_syncing(panic_message: string) {
    if (Registrar.synced) panic(panic_message);
  }
}
