import { CommandFn, LocalCommand } from 'porygon/interaction';
// import * as api from 'pokemon';

const pokemon: CommandFn = async () => {
  // const result = await api.pokemon('Bulbasaur');
  // await embed.merge(result).reply();
};

export default new LocalCommand(pokemon, {
  description: 'Looks up Pokémon information.',
});

export const __SKIP_FILE__ = 1;
