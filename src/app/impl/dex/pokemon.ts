import { logger } from 'core/logger';
import { Maybe } from 'support/null';
import INDEX_BUCKETS from './data/pokemon_indices.json';

interface Entity {
  name: string;
  slug: string;
}

export type PokemonFormVariance =
  | { variance: 'default' }
  | { variance: 'variant'; slug: string; parent: string }
  | { variance: 'meta-variant'; slug: string; parent: string };

export interface PokemonForm {
  id: number;
  slug: string;
  name: string;
  variance: PokemonFormVariance;
  generation: number;
  height: string;
  weight: string;
  types: Entity[];
  abilities: (Entity & { is_hidden: boolean })[];
}

export interface Pokemon {
  id: number;
  slug: string;
  name: {
    english: string;
    roomaji: string;
    kanji: string;
  };
  genus: string;
  color: string;
  default_form: string;
  forms: Record<string, PokemonForm>;
  gender_ratio: Entity;
  egg_groups: Entity[];
  evolutions: Entity[][];
  flavour_text: string;
}

let pokemon: { [key: string]: Maybe<Pokemon> };

export async function fetch_pokemon(slug: string): Promise<Maybe<Pokemon>> {
  if (!pokemon) {
    pokemon = <any>await import('./data/pokemon.json');
    logger.info('The %Pokémon table% has been imported!');
  }

  return pokemon[slug];
}

const SPRITES_URL =
  'https://raw.githubusercontent.com/tipsypastels/porygon2-pokemon-data/master/output/sprites';

export type SpriteDir = 'front' | 'back' | 'front-shiny' | 'back-shiny';

export function fetch_pokemon_sprite(slug: string, dir: SpriteDir = 'front') {
  return `${SPRITES_URL}/${dir}/${slug}.png`;
}

interface SearchResult {
  name: string;
  value: string;
}

type BucketKey = keyof typeof INDEX_BUCKETS;

export function search_pokemon(input: string): Maybe<SearchResult[]> {
  if (input.length < 1) {
    return;
  }

  if (input.length === 1 || input.length === 2) {
    return INDEX_BUCKETS[input as BucketKey] ?? [];
  }

  const first_two_chars = input.slice(0, 2);
  const indices = INDEX_BUCKETS[first_two_chars as BucketKey] ?? [];

  return indices.filter((x) => x.value.includes(input));
}
