import { GuildMember } from 'discord.js';
import { Command } from 'interaction/command';
import { TicTacToe } from '../models/tic_tac_toe';

interface Opts {
  against: GuildMember;
}

const ttt: Command<Opts> = async ({ opts, channel, interaction, member }) => {
  const game = new TicTacToe({
    channel,
    interaction,
    playerX: member,
    playerO: opts.against,
  });

  await game.start();
};

ttt.description = 'Starts a tic-tac-toe match with you and another member.';
ttt.options = [
  {
    name: 'against',
    type: 'USER',
    required: true,
    description: 'The opponent to play against.',
  },
];

export default ttt;
