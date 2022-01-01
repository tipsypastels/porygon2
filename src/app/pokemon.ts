import { add_command, ChatCommand } from 'core/command';
import { DUCK } from 'core/controller';
import { fetch_pokemon } from './impl/pokemon/pokemon';

const pokemon: ChatCommand = async ({ embed }) => {
  const pokemon = await fetch_pokemon('psyduck');
  embed.merge(pokemon);
};

add_command(DUCK, pokemon, { name: 'pokemon', description: 'asdf' });
