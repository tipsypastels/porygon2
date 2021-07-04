import { gql } from 'graphql-request';
import { codeBlock } from 'support/format';
import { inspect } from 'util';
import { createQuery } from './create';
import { PokemonQuery_mon } from './types';

const QUERY = gql`
  query PokemonQuery($name: String!) {
    mon: pokemon_v2_pokemon(limit: 1, where: { name: { _ilike: $name } }) {
      id
      name

      types: pokemon_v2_pokemontypes {
        type: pokemon_v2_type {
          name
        }
      }

      abilities: pokemon_v2_pokemonabilities {
        ability: pokemon_v2_ability {
          name
        }
      }

      species: pokemon_v2_pokemonspecy {
        name
      }
    }
  }
`;

export const pokemon = createQuery<PokemonQuery_mon>(QUERY, {
  embed(mon, embed) {
    embed
      .setTitle(mon.name)
      .setDescription(codeBlock(inspect(mon, { depth: null })));
  },
});
