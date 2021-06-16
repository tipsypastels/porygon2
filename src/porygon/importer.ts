/* eslint-disable @typescript-eslint/no-unused-vars */

import { basename } from 'path';
import { eachFile } from 'support/dir';
import { logger } from './logger';

const SKIP_FILE_SENTINEL = '__SKIP_FILE__';

type Each = (dir: string) => Generator<string>;
type ImportCb<R> = (result: R, file: string) => unknown;

export interface ImporterOpts {
  dir: string;
  each?: Each;
}

export class Importer<T, R = T> {
  protected dir: string;
  protected each: Each;

  constructor(opts: ImporterOpts) {
    this.dir = opts.dir;
    this.each = opts.each ?? eachFile;
  }

  async import(cb?: ImportCb<R>) {
    const files = Array.from(this.each(this.dir));
    const promises = files.map(async (file) => {
      if (this.shouldSkipFile(file)) {
        return;
      }

      this.beforeImport(file);

      const mod = await this.importFile(file);

      this.afterImport(mod, file);

      if (this.shouldSkipModule(mod, file)) {
        return;
      }

      if (!this.hasDefaultExport(mod)) {
        this.onMissingDefaultExport(file);
        return;
      }

      const result = await this.transform(mod.default, file);

      cb?.(result, file);
    });

    return await Promise.all(promises);
  }

  async toArray() {
    const array: R[] = [];
    await this.import((item) => array.push(item));
    return array;
  }

  protected importFile(file: string): unknown {
    return import(file).catch((e) => this.onImportFailure(e, file));
  }

  protected shouldSkipFile(_file: string) {
    return false;
  }

  protected shouldSkipModule(mod: unknown, _file: string) {
    return this.hasExport(mod, SKIP_FILE_SENTINEL);
  }

  protected beforeImport(_file: string) {
    // does nothing by default
  }

  protected afterImport(_mod: unknown, _file: string) {
    // does nothing by default
  }

  protected onImportFailure(error: any, file: string) {
    this.error(`file ${basename(file)} failed to import: ${error}`);

    if ('stack' in error) {
      this.error(error.stack);
    }
  }

  protected onMissingDefaultExport(file: string) {
    this.error(`${basename(file)} has no default export`);
  }

  protected hasDefaultExport(mod: unknown): mod is { default: unknown } {
    return this.hasExport(mod, 'default');
  }

  protected async transform(defaultExport: unknown, file: string) {
    return defaultExport as R;
  }

  protected hasExport(mod: unknown, exportName: string) {
    return !!(mod && typeof mod === 'object' && exportName in mod);
  }

  protected error(error: string) {
    logger.error(`${this.constructor.name} ${error}`);
  }
}
