import { take } from 'core/assert';
import { Embed, IntoEmbed } from 'core/embed';
import { AsyncCache } from 'support/cache';
import { IS_DEBUG } from 'support/env';
import { pokeapi_fetch } from './api';

const OP = /query ([^ (]*)/;

interface Opts<T, D> {
  query: string;
  is_empty(raw: T): boolean;
  prepare(raw: T): D;
  into_embed: IntoEmbed<[D]>;
}

type CacheCell<D> =
  | { kind: 'ok'; data: D }
  | { kind: 'empty' }
  | { kind: 'error'; error: unknown };

export function create_pokemon_entity<T, D>(opts: Opts<T, D>) {
  const cache = new AsyncCache(fetch);
  const op = take(OP.exec(opts.query), 'Malformed query!')[1];

  async function fetch(name: string): Promise<CacheCell<D>> {
    try {
      const { data: raw } = await pokeapi_fetch(opts.query, { name }, op);
      if (opts.is_empty(raw)) {
        return { kind: 'empty' };
      }

      return { kind: 'ok', data: opts.prepare(raw) };
    } catch (error) {
      return { kind: 'error', error };
    }
  }

  return async function get(name: string) {
    const [cell, preexisting] = await cache.get_with_status(name);
    return (embed: Embed) => {
      // prettier-ignore
      switch (cell.kind) {
        case 'empty': return embed.merge(no_results, name);
        case 'error': return embed.merge(crashed, cell.error);
        case 'ok': {
          embed.merge<[D]>(opts.into_embed, cell.data);
    
          if (IS_DEBUG) {
            embed.foot(`Data Source: ${preexisting ? 'Cache' : 'Query'}`);
          }
        }
      }
    };
  };
}

const no_results: IntoEmbed<[string]> = (e, name) => {
  e.title(`No Results - ${name}`);
};

const crashed: IntoEmbed<[unknown]> = (e, error) => {
  e.title('Crashed').about(`${error}`);
};
