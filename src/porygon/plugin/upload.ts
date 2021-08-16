import { ApplicationCommand as Api } from 'discord.js';
import { BaseCommand } from 'porygon/interaction';
import { Plugin } from './plugin';
import { PluginKind } from './kind';
import { areSharedPropertiesEqual } from 'support/object';
import { writeFile } from 'fs/promises';
import { bugLogger, setupLogger } from 'porygon/logger';
import isEqual from 'lodash.isequal';

type Result = Promise<Api[]>;
type Cache = Record<string, Api>;

/**
 * Manages uploading and caching of commands for a given plugin. Each plugin has its
 * own entry in the `.cmd_cache` directory, named by its kind's tag (the only stable way
 * to uniquely identify a plugin).
 *
 * A `PluginCommandUploader` will compare all the data from the gathered commands, and
 * compare them to what's in the cache. If there is no cache, it simply uploads them all.
 * If none have changed, it uses the cached data. If one has changed, it simply uploads it
 * on its own via single upload. If multiple have changed, it uploads them all, which is
 * probably better than multiple single uploads.
 *
 * Note: in production, for plugins whose guild is not joined, the cache will contain `{}`,
 * and the uploader will think it's trying to upload them all every time. However, uploading
 * to an unjoined guild is a no-op in `PluginKind`, so this will never change. This isn't
 * a problem in practice, but it can make logging slightly inaccurate because it will
 * always report that commands have changed.
 */
export class PluginCommandUploader {
  constructor(
    private plugin: Plugin,
    private kind: PluginKind,
    private commands: BaseCommand[],
  ) {}

  private get client() {
    return this.plugin.client;
  }

  private get tag() {
    return this.kind.tag;
  }

  async upload(): Result {
    const cache = await this.getCache();
    let apis: Api[];

    if (!cache) {
      apis = await this.uploadAll();
    } else {
      const changed = this.findChanged(cache);
      if (changed.length === 0) return this.keepAll(cache);

      if (changed.length === 1) {
        apis = await this.uploadOneChanged(cache, changed[0]);
      } else {
        apis = await this.uploadAll();
      }
    }

    this.setCache(apis); // don't use async, doesn't have to be immediate
    return apis;
  }

  private findChanged(cache: Cache) {
    return this.commands.reduce((list: BaseCommand[], command) => {
      const entry = cache[command.data.name];
      const changed = !entry || !sharedDeepEqual(entry, command.data);
      return changed ? list.concat(command) : list;
    }, []);
  }

  private getCache(): Promise<Cache | null> {
    return import(`../../../${this.cacheFile}`).catch((e) => null);
  }

  private async setCache(apis: Api[]) {
    const cache = apis.reduce((cache: Cache, api) => ({ ...cache, [api.name]: api }), {});
    const cacheJSON = JSON.stringify(cache, null, 2);

    await writeFile(this.cacheFile, cacheJSON).catch((e) => {
      bugLogger.warn(`Failed to write command cache for ${this.tag}: ${e}`);
    });
  }

  private get cacheFile() {
    return `.cmd_cache/${this.tag}.json`;
  }

  private uploadAll(): Result {
    setupLogger.info(`Reuploading all commands for ${this.tag}.`);

    const data = this.commands.map((c) => c.data);
    return this.kind.upload(data, this.client);
  }

  private async uploadOneChanged(cache: Cache, change: BaseCommand): Result {
    setupLogger.info(`Uploading changed command ${change.data.name} for ${this.tag}.`);

    const api = await this.kind.uploadOne(change.data, this.client);
    const newApis = { ...cache, ...(api && { [api.name]: api }) };
    return Object.values(newApis);
  }

  private async keepAll(cache: Cache) {
    setupLogger.info(`Keeping all commands for ${this.tag}.`);
    return Object.values(cache);
  }
}

function sharedDeepEqual(a: any, b: any) {
  return areSharedPropertiesEqual(a, b, isEqual);
}
