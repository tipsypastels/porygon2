import { add_command, ChatCommand, ChatCommandData } from 'core/command';
import { DUCK, POKECOM_STAFF } from 'core/controller';
import { Hangman } from './impl/hangman';

const hangman: ChatCommand = async ({ channel, reply }) => {
  const game = new Hangman({ channel, reply });
  await game.start();
};

const data: ChatCommandData = {
  name: 'hangman',
  description: 'Starts a game of hangman.',
};

add_command(DUCK, hangman, data);
add_command(POKECOM_STAFF, hangman, data);
