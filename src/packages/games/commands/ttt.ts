import { GuildMember } from 'discord.js';
import { CommandFn, LocalCommand } from 'porygon/interaction';
import { TicTacToe } from '../tic_tac_toe';

interface Opts {
  against: GuildMember;
}

const ttt: CommandFn<Opts> = async ({ opts, channel, interaction, author }) => {
  const game = new TicTacToe({
    channel,
    interaction,
    playerX: author,
    playerO: opts.against,
  });

  await game.start();
};

export default new LocalCommand(ttt, {
  description: 'Starts a tic-tac-toe match with you and another member.',
  options: [
    {
      name: 'against',
      type: 'USER',
      required: true,
      description: 'The opponent to play against.',
    },
  ],
});
