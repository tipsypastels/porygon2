import fromEntries from 'object.fromentries';
import { stat, writeFile } from 'fs/promises';
import { upload } from './imgur';
import { logger } from 'porygon/logger';
import { chunkAssets, mapAssets } from './map';
import { Seconds } from 'support/time';

type UploadCache = {
  lastRun: number;
  urls: Record<string, string>;
};

const CACHE_FILE = 'assets/upload_cache.json';

let done = false;

export function assetSetupIsDone() {
  return done;
}

export async function setupAssets() {
  // ensure all assets are loaded
  await import('../assets');

  const chunks = chunkAssets();
  const cache = await fetchUploadCache();
  const lastRun = cache?.lastRun ?? 0;

  let shouldCreateNextUploadCache = !cache;

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    const isNotLastChunk = i < chunks.length - 1;

    let didUploadAnyThisChunk = false;

    const promises = chunk.map(async (asset) => {
      const { mtime } = await stat(asset.path);

      if (cache?.urls[asset.path] && mtime.getTime() <= lastRun) {
        asset.url = cache.urls[asset.path];
        return;
      }

      logger.setup(`Uploading asset ${asset.path}...`);

      const url = await upload(asset);

      asset.url = url;

      shouldCreateNextUploadCache = true;
      didUploadAnyThisChunk = true;
    });

    await Promise.all(promises);

    if (didUploadAnyThisChunk && isNotLastChunk) {
      await pause();
    }
  }

  logger.info('Done uploading.');

  if (shouldCreateNextUploadCache) {
    await createNextUploadCache();
  }

  done = true;
}

function fetchUploadCache(): Promise<UploadCache | null> {
  return import(`../../../${CACHE_FILE}`)
    .then((cache: UploadCache) => {
      logger.setup('Fetched asset cache...');
      return cache;
    })
    .catch(() => {
      logger.warn('No asset upload cache found, creating a new one.');
      return null;
    });
}

async function createNextUploadCache() {
  const urls = fromEntries(mapAssets((asset) => [asset.path, asset.url]));
  const cache: UploadCache = { lastRun: Date.now(), urls };
  const json = JSON.stringify(cache, null, 2);

  await writeFile(CACHE_FILE, json);
}

function pause() {
  logger.warn('Pausing upload for a few seconds to avoid 429...');

  return new Promise<void>((resolve) => {
    setTimeout(() => resolve(), Seconds(10));
  });
}
