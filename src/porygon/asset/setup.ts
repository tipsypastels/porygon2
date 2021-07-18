import { TextChannel } from 'discord.js';
import { stat, writeFile } from 'fs/promises';
import fromEntries from 'object.fromentries';
import { Porygon } from 'porygon/client';
import { logger } from 'porygon/logger';
import { setting } from 'porygon/settings';
import { eachAsset, mapAssets } from './map';

type UploadCache = {
  lastRun: number;
  urls: Record<string, string>;
};

const CACHE_FILE = 'assets/upload_cache.json';
const UPLOAD_DEST = setting('pory.assets.upload_dump');

let done = false;

export function assetSetupIsDone() {
  return done;
}

export async function setupAssets(client: Porygon) {
  // ensure all assets are loaded
  await import('../assets');

  const [cache, channel] = await Promise.all([
    fetchUploadCache(),
    fetchUploadChannel(client),
  ]);

  const lastRun = cache?.lastRun ?? 0;

  let shouldCreateNextUploadCache = !cache;

  for (const asset of eachAsset()) {
    const { mtime } = await stat(asset.path);

    if (cache?.urls[asset.path] && mtime.getTime() <= lastRun) {
      asset.url = cache.urls[asset.path];
      continue;
    }

    logger.setup(`Uploading asset ${asset.path}...`);

    const message = await channel.send({ files: [asset.path] });
    const attachment = message.attachments.first()!;

    asset.url = attachment.url;

    shouldCreateNextUploadCache = true;
  }

  if (shouldCreateNextUploadCache) {
    await createNextUploadCache();
  }

  done = true;
}

export function fetchUploadChannel(client: Porygon) {
  const { guild, channel } = UPLOAD_DEST.value;
  return client.guilds.cache.get(guild)!.channels.cache.get(channel) as TextChannel;
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
