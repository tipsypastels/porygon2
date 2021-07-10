import { CommandFn, LocalCommand } from 'porygon/interaction';
import { Hangman } from '../hangman';

const hangman: CommandFn = async ({ channel, interaction }) => {
  const game = new Hangman({ channel, interaction });
  await game.start();
};

export default new LocalCommand(hangman, {
  description: 'Starts a hangman game.',
});
