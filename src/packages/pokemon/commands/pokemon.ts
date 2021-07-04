import { Command } from 'porygon/interaction';
// import * as api from 'pokemon';

const pokemon: Command.Fn = async () => {
  // const result = await api.pokemon('Bulbasaur');
  // await embed.merge(result).reply();
};

export default new Command(pokemon, {
  description: 'Looks up Pokémon information.',
});

export const __SKIP_FILE__ = 1;
