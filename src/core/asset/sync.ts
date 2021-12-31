import { try_get_guild } from 'core/guild';
import { logger, panic } from 'core/logger';
import { Client, Collection, TextChannel } from 'discord.js';
import { IS_STAGING, staging } from 'support/env';
import { noop } from 'support/fn';
import { Maybe } from 'support/null';
import { Asset } from './asset';
import { stat, writeFile as write } from 'fs/promises';
import { from_entries } from 'support/iterator';
import { panic_assert } from 'core/assert';

const DUMP_GUILD = staging('staging', 'duck');
const DUMP_CHANNEL = staging('924933272935489537', '866445374378344468');

interface Cache {
  last_run: number;
  urls: Record<string, string>;
}

type Assets = Collection<string, Asset>;

export async function sync_assets(client: Client, dir: string, assets: Assets) {
  await import('../assets'); // ensure all assets are loaded

  let should_create_next_cache = false;
  const [cache, channel] = await Promise.all([fetch_cache(dir), fetch_channel(client)]);

  if (!channel) {
    return;
  }

  for (const [, asset] of assets) {
    if (cache?.urls[asset.path] && (await untouched(asset.path, cache))) {
      asset.url = cache.urls[asset.path];
      continue;
    }

    logger.info(`Uploading asset %${asset.path}%...`);

    const message = await channel.send({ files: [asset.path] });
    const attachment = message.attachments.first()!;

    asset.url = attachment.url;
    should_create_next_cache = true;
  }

  if (should_create_next_cache) {
    await create_next_cache(dir, assets);
  }
}

async function fetch_channel(client: Client) {
  const guild = try_get_guild(DUMP_GUILD, client);
  const channel = await guild?.channels.fetch(DUMP_CHANNEL).catch(noop);

  if (!channel) {
    const fn = IS_STAGING ? panic : logger.error;
    fn('Asset channel could not be located!');
    return;
  }

  panic_assert(channel instanceof TextChannel, 'Expected asset channel to be text');
  return channel;
}

async function fetch_cache(dir: string): Promise<Maybe<Cache>> {
  try {
    return await import(`../../../assets/${dir}/.cache.json`);
  } catch {
    logger.debug('Creating an asset cache...');
  }
}

function create_next_cache(dir: string, assets: Assets) {
  const urls = from_entries(assets.map((a) => <const>[a.path, a.url]));
  const cache: Cache = { last_run: Date.now(), urls };
  const json = JSON.stringify(cache, null, 2);

  return write(`./assets/${dir}/.cache.json`, json);
}

async function untouched(file: string, cache: Cache) {
  const { mtime } = await stat(file);
  return mtime.getTime() <= cache.last_run;
}
