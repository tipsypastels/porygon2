import {
  add_autocomplete,
  add_sub_commands,
  Autocomplete,
  ChatCommand,
} from 'core/command';
import { DUCK } from 'core/controller';
import { lower } from 'support/string';
import { fetch_pokemon } from './impl/pokemon/pokemon';
import { search_pokemon } from './impl/pokemon/pokemon_search';

const pokemon: ChatCommand = async ({ embed, opts }) => {
  const search = opts.str('search');
  const pokemon = await fetch_pokemon(search);
  embed.merge(pokemon);
};

const commands = { pokemon };

add_sub_commands(DUCK, commands, {
  name: 'dex',
  description: 'TODO write a description',
  options: [
    {
      name: 'pokemon',
      description: 'Looks up information about a Pokémon.',
      type: 'SUB_COMMAND',
      options: [
        {
          name: 'search',
          description: 'The name of the Pokémon. Continue typing to refine search...',
          type: 'STRING',
          required: true,
          autocomplete: true,
        },
      ],
    },
  ],
});

const pokemon_search_autocomplete: Autocomplete = async (args) => {
  const input = lower(`%${args.input}%`);
  const suggestions = await search_pokemon(input);

  return suggestions;
};

add_autocomplete(pokemon, 'search', pokemon_search_autocomplete);
