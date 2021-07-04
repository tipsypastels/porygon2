import { request } from 'graphql-request';
import { Embed } from 'porygon/embed';
import { AsyncCache } from 'support/cache';
import { extractOnlyKey } from 'support/object';

const URL = 'https://beta.pokeapi.co/graphql/v1beta';

type WithIntoEmbed<T> = T & { intoEmbed(embed: Embed): void };

interface Opts<T> {
  nonUnique?: boolean;
  embed(value: T, embed: Embed): void;
}

export function createQuery<T>(query: string, opts: Opts<T>) {
  const cache = new AsyncCache<string, T>(async (name: string) => {
    const response = await request(URL, query, { name });
    const key = extractOnlyKey(response);
    const entries = response[key];

    if (opts.nonUnique) {
      return entries;
    }

    return entries[0];
  });

  async function get(name: string): Promise<WithIntoEmbed<T>> {
    const entry = (await cache.get(name)) as WithIntoEmbed<T>;

    entry.intoEmbed = function (embed: Embed) {
      opts.embed(this, embed);
    };

    return entry;
  }

  get.cache = cache;
  return get;
}
