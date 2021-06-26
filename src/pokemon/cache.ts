import { fetch } from './fetch';
import { log } from './logger';
import type { Kind, Kinds } from './kind';
import type { Base } from './models';

const CACHE = new Map<string, Base<any>>();

export async function get<K extends Kind>(kind: K, id: string) {
  const key = toKey(kind, id);

  if (CACHE.has(key)) {
    log(`Found ${key} in the cache.`);
    return CACHE.get(key) as Kinds[K];
  }

  log(`${key} was not in the cache, fetching...`);
  const res = await fetch(kind, id);
  CACHE.set(key, res);

  return res as Kinds[K] | undefined;
}

export async function getNonNull<K extends Kind>(kind: K, id: string) {
  const res = await get(kind, id);

  if (!res) {
    throw new Error(`Couldn't get entry ${id} for kind ${kind}.`);
  }

  return res;
}

export function clearCache() {
  return CACHE.clear();
}

export function cacheSize() {
  return CACHE.size;
}

export function cacheHas(kind: Kind, id: string) {
  return CACHE.has(toKey(kind, id));
}

function toKey(kind: Kind, id: string) {
  return `${kind}%${id}`;
}
