import { take } from 'core/assert';
import { Embed, IntoEmbed } from 'core/embed';
import { AsyncCache } from 'support/cache';
import { IS_DEBUG } from 'support/env';
import { pokeapi_fetch } from './api';

const OP = /query ([^ (]*)/;

interface Opts<T, D> {
  query: string;
  prepare(raw: T): D;
  into_embed: IntoEmbed<[D]>;
}

export function create_pokemon_entity<T, D>(opts: Opts<T, D>) {
  const cache = new AsyncCache(fetch);
  const op = take(OP.exec(opts.query), 'Malformed query!')[1];

  async function fetch(name: string) {
    const raw = await pokeapi_fetch(opts.query, { name }, op);
    return opts.prepare(raw.data);
  }

  return async function get(name: string) {
    const [data, preexisting] = await cache.get_with_status(name);
    return (embed: Embed) => {
      embed.merge<[D]>(opts.into_embed, data);

      if (IS_DEBUG) {
        embed.foot(`Data Source: ${preexisting ? 'Cache' : 'Query'}`);
      }
    };
  };
}
