import { gql } from './api';
import { create_pokemon_entity } from './entity';
import * as query from './__generated__/pokemon';
import {
  delete_prefix,
  delete_suffix,
  italics,
  plural_word,
  strip_indent,
  upper,
} from 'support/string';
import { is_some, Maybe } from 'support/null';
import { build_evolution_tree } from './evolution_chain';

export const fetch_pokemon = create_pokemon_entity({
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

  into_embed(e, data: query.pokemon) {
    const species = data.species[0];
    const form = species.form.nodes[0];

    // Part 1: Name
    {
      const name = species.names[0].name;
      e.author('Pokemon').title(name);
    }

    // Part 2: Generation
    {
      const gen = species.generation;
      if (gen) {
        // formatted as generation-i in the API
        const name = upper(delete_prefix('generation-', gen.name));
        e.about(`Discovered in generation ${name}.`);
      }
    }

    // Part 3: Number
    {
      e.inline('Number', `${species.id}`);
    }

    // Part 4: Genus
    {
      const genus = delete_suffix(' Pokémon', species.names[0].genus);
      e.inline('Species', genus);
    }

    // Part 5: Types
    {
      const types = form.types.map((t) => name_of(t.type));
      const first = types[0];
      const label = plural_word(types.length, 'Type');

      e.inline(label, types.join('\n'));

      if (first) {
        e.color_from(TYPE_COLORS[first]);
      } else {
        e.color('ok');
      }
    }

    // Part 6: Abilities
    {
      const normal: string[] = [];
      let hidden: string | undefined;

      for (const ability of form.abilities) {
        const name = name_of(ability.ability);

        if (!name) {
          continue;
        }

        if (ability.is_hidden) {
          hidden = name;
        } else {
          normal.push(name);
        }
      }

      const list = strip_indent`
        Normal: ${normal.length ? normal.join(', ') : '-'}
        Hidden: ${hidden ?? '-'}
      `;

      e.inline('Abilities', list);
    }

    // Part 7: Egg Groups
    {
      const names = filter_map(species.egg_groups, (g) => name_of(g.group));
      e.inline('Egg Groups', names.join('\n'));
    }

    // Part 8: Gender Rate
    {
      const rate = species.gender_rate ?? -1;
      e.inline('Gender Ratio', GENDER_RATES[rate]);
    }

    // Part 9: Height
    {
      if (form.height) {
        const meters = form.height / 10;
        e.inline('Height', `${meters}m`);
      }
    }

    // Part 10: Weight
    {
      if (form.weight) {
        const kg = form.weight / 10;
        e.inline('Weight', `${kg}kg`);
      }
    }

    // Part 11: Evolution Chain
    {
      const evos = species.evolution_chain?.evolutions;
      if (evos?.length) {
        const tree = build_evolution_tree(evos);
        const text = tree
          .map((chain) => {
            // TODO: add a way to map when creating the tree and
            // skip an inner loop?
            const names = chain.map((node) => {
              const name = node.names[0].name;
              return node.id === species.id ? italics(name) : name;
            });
            return names.join(' › ');
          })
          .join('\n');

        e.field('Evolutions', text);
      }
    }
  },
});

function name_of(obj: Maybe<{ names: Maybe<{ name: string }[]> }>): Maybe<string> {
  return obj?.names?.[0].name;
}

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
