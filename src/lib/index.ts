import { Collection } from 'discord.js';
import { pokecom } from './lib_pokecom';

export default new Collection([pokecom].map((l) => l.toCollectionEntry()));
