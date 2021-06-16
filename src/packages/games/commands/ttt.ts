import { GuildMember } from 'discord.js';
import { Command } from 'porygon/interaction';
import { TicTacToe } from '../tic_tac_toe';

interface Opts {
  against: GuildMember;
}

const ttt: Command.Fn<Opts> = async ({
  opts,
  channel,
  interaction,
  member,
}) => {
  const game = new TicTacToe({
    channel,
    interaction,
    playerX: member,
    playerO: opts.against,
  });

  await game.start();
};

export default new Command(ttt, {
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
