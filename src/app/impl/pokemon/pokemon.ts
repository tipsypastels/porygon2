import { gql } from './api';
import { create_pokemon_entity } from './entity';
import * as query from './__generated__/pokemon';
import { delete_prefix, delete_suffix, plural_word, upper } from 'support/string';
import { is_some, Maybe } from 'support/null';
import { build_evolution_tree } from './evolution_chain';
import { fetch_pokemon_sprite } from './sprites';

type Raw = query.pokemon;

interface Data {
  id: number;
  name: string;
  genus: string;
  generation?: string;
  types: {
    names: string;
    first: string;
    label: string;
  };
  abilities?: string;
  egg_groups?: string;
  gender_rate: string;
  height?: string;
  weight?: string;
  evolutions?: string;
  sprite_url: string;
}

export const fetch_pokemon = create_pokemon_entity<Raw, Data>({
  query: gql`
    query pokemon($name: String!) {
      species: pokemon_v2_pokemonspecies(where: { name: { _eq: $name } }) {
        id
        gender_rate
        names: pokemon_v2_pokemonspeciesnames(
          where: { pokemon_v2_language: { name: { _eq: "en" } } }
        ) {
          name
          genus
        }
        generation: pokemon_v2_generation {
          name
        }
        # TODO: this is gonna turn into way worse hell
        form: pokemon_v2_pokemons_aggregate(limit: 1) {
          nodes {
            name
            height
            weight
            types: pokemon_v2_pokemontypes {
              type: pokemon_v2_type {
                names: pokemon_v2_typenames(
                  where: { pokemon_v2_language: { name: { _eq: "en" } } }
                ) {
                  name
                }
              }
            }
            abilities: pokemon_v2_pokemonabilities(order_by: { is_hidden: asc }) {
              ability: pokemon_v2_ability {
                names: pokemon_v2_abilitynames(
                  where: { pokemon_v2_language: { name: { _eq: "en" } } }
                ) {
                  name
                }
              }
              is_hidden
            }
          }
        }
        egg_groups: pokemon_v2_pokemonegggroups {
          group: pokemon_v2_egggroup {
            names: pokemon_v2_egggroupnames(
              where: { pokemon_v2_language: { name: { _eq: "en" } } }
            ) {
              name
            }
          }
        }
        evolution_chain: pokemon_v2_evolutionchain {
          evolutions: pokemon_v2_pokemonspecies(
            order_by: { evolves_from_species_id: asc_nulls_first }
          ) {
            id
            name
            parent_id: evolves_from_species_id
            names: pokemon_v2_pokemonspeciesnames(
              where: { pokemon_v2_language: { name: { _eq: "en" } } }
            ) {
              name
            }
          }
        }
      }
    }
  `,

  is_empty(raw) {
    return raw.species.length === 0;
  },

  prepare(raw) {
    const data: Partial<Data> = {};

    const species = raw.species[0];
    const form = species.form.nodes[0];

    // Basics
    {
      data.id = species.id;
      data.name = species.names[0].name;
      data.genus = delete_suffix(' Pokémon', species.names[0].genus);
    }

    // Generation
    {
      const gen = species.generation;
      if (gen) {
        // comes formatted as generation-iii
        const name = upper(delete_prefix('generation-', gen.name));
        data.generation = `Discovered in generation ${name}.`;
      }
    }

    // Types
    {
      const names = form.types.map((t) => t.type!.names[0].name);
      const first = names[0];
      const label = plural_word(names.length, 'Type');
      data.types = { names: names.join('\n'), first, label };
    }

    // Abilities
    {
      const names = filter_map(form.abilities, (x) => {
        const name = x.ability?.names[0].name;
        return x.is_hidden ? `${name} (H)` : name;
      });

      if (names.length) data.abilities = names.join('\n');
    }

    // Egg Groups
    {
      const names = filter_map(species.egg_groups, (g) => g.group?.names[0].name);
      if (names.length) data.egg_groups = names.join('\n');
    }

    // Gender Rate
    {
      data.gender_rate = GENDER_RATES[species.gender_rate ?? -1];
    }

    // Height
    {
      if (form.height) {
        data.height = `${form.height / 10}m`;
      }
    }

    // Weight
    {
      if (form.weight) {
        data.weight = `${form.weight / 10}kg`;
      }
    }

    // Evolutions
    {
      const evos = species.evolution_chain?.evolutions;
      if (evos?.length) {
        const tree = build_evolution_tree(evos).map((x) => {
          return x.map((m) => m.names[0].name).join(' › ');
        });

        data.evolutions = tree.join('\n');
      }
    }

    // Sprite
    {
      data.sprite_url = fetch_pokemon_sprite(species.id);
    }

    return <Data>data;
  },

  into_embed(e, data) {
    e.author('Pokémon')
      .thumb(data.sprite_url)
      .title(data.name)
      .try_about(data.generation)
      .inline('Number', `${data.id}`)
      .inline('Species', data.genus)
      .inline(data.types.label, data.types.names)
      .color_from(TYPE_COLORS[data.types.first])
      .try_inline('Abilities', data.abilities)
      .try_inline('Egg Groups', data.egg_groups)
      .inline('Gender Ratio', data.gender_rate)
      .try_inline('Height', data.height)
      .try_inline('Weight', data.weight)
      .try_field('Evolutions', data.evolutions);
  },
});

// TODO: this should go in array or iterator, but i'm not
// super into it being lazy, and before moving we should reconsider
// whether that iterator focus was even worth it: we never use it
function filter_map<T, R>(ary: T[], fn: (t: T) => Maybe<R>): R[] {
  const out: R[] = [];

  for (const elem of ary) {
    const elem2 = fn(elem);

    if (is_some(elem2)) {
      out.push(elem2);
    }
  }

  return out;
}

const TYPE_COLORS: Record<string, number> = {
  Normal: 0xa8a878,
  Fire: 0xf08030,
  Fighting: 0xc03028,
  Water: 0x6890f0,
  Flying: 0xa890f0,
  Grass: 0x78c850,
  Poison: 0xa040a0,
  Electric: 0xf8d030,
  Ground: 0xe0c068,
  Psychic: 0xf85888,
  Rock: 0xb8a038,
  Ice: 0x98d8d8,
  Bug: 0xa8b820,
  Dragon: 0x7038f8,
  Ghost: 0x705898,
  Dark: 0x705848,
  Steel: 0xb8b8d0,
  Fairy: 0xee99ac,
};

const GENDER_RATES: Record<number, string> = {
  [-1]: 'Genderless',
  0: 'Always Male',
  1: '12.5% Female',
  2: '25% Female',
  4: 'Fifty Fifty',
  // 5 seems to be unused
  6: '75% Female',
  7: '87.5% Female',
  8: 'Always Female',
};
