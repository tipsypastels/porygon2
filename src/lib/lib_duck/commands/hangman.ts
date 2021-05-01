import { Command } from 'interaction/command';
import { Hangman } from '../models/hangman';

const hangman: Command = async ({ channel, interaction }) => {
  const game = new Hangman({ channel, interaction });
  await game.start();
};

hangman.description = 'Starts a hangman game.';

export default hangman;
