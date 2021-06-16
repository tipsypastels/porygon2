import { Command } from 'porygon/interaction/command';
import { Hangman } from '../hangman';

const hangman: Command.Fn = async ({ channel, interaction }) => {
  const game = new Hangman({ channel, interaction });
  await game.start();
};

export default new Command(hangman, { description: 'Starts a hangman game.' });
