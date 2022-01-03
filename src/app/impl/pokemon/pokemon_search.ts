import { AsyncCache } from 'support/cache';
import { gql, pokeapi_fetch } from './api';
import { search_pokemon_species } from './__generated__/search_pokemon';

const QUERY = gql`
  query search_pokemon($like: String!) {
    species: pokemon_v2_pokemonspecies(
      where: { name: { _like: $like } }
      limit: 25
      order_by: { order: asc }
    ) {
      value: name
      names: pokemon_v2_pokemonspeciesnames(
        where: { pokemon_v2_language: { name: { _eq: "en" } } }
      ) {
        name
      }
    }
  }
`;

const CACHE = new AsyncCache(async (like: string) => {
  if (like === '%%') {
    return FIRST_25_POKEMON;
  }

  const { data } = await pokeapi_fetch(QUERY, { like }, 'search_pokemon');
  const species: search_pokemon_species[] = data.species;
  return species.map((x) => ({ name: x.names[0].name, value: x.value }));
});

export function search_pokemon(like: string) {
  return CACHE.get(like);
}

const FIRST_25_POKEMON = [
  {
    value: 'bulbasaur',
    name: 'Bulbasaur',
  },
  {
    value: 'ivysaur',
    name: 'Ivysaur',
  },
  {
    value: 'venusaur',
    name: 'Venusaur',
  },
  {
    value: 'charmander',
    name: 'Charmander',
  },
  {
    value: 'charmeleon',
    name: 'Charmeleon',
  },
  {
    value: 'charizard',
    name: 'Charizard',
  },
  {
    value: 'squirtle',
    name: 'Squirtle',
  },
  {
    value: 'wartortle',
    name: 'Wartortle',
  },
  {
    value: 'blastoise',
    name: 'Blastoise',
  },
  {
    value: 'caterpie',
    name: 'Caterpie',
  },
  {
    value: 'metapod',
    name: 'Metapod',
  },
  {
    value: 'butterfree',
    name: 'Butterfree',
  },
  {
    value: 'weedle',
    name: 'Weedle',
  },
  {
    value: 'kakuna',
    name: 'Kakuna',
  },
  {
    value: 'beedrill',
    name: 'Beedrill',
  },
  {
    value: 'pidgey',
    name: 'Pidgey',
  },
  {
    value: 'pidgeotto',
    name: 'Pidgeotto',
  },
  {
    value: 'pidgeot',
    name: 'Pidgeot',
  },
  {
    value: 'rattata',
    name: 'Rattata',
  },
  {
    value: 'raticate',
    name: 'Raticate',
  },
  {
    value: 'spearow',
    name: 'Spearow',
  },
  {
    value: 'fearow',
    name: 'Fearow',
  },
  {
    value: 'ekans',
    name: 'Ekans',
  },
  {
    value: 'arbok',
    name: 'Arbok',
  },
  {
    value: 'pichu',
    name: 'Pichu',
  },
];
