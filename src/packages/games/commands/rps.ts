import { GuildMember } from 'discord.js';
import { Command } from 'porygon/interaction/command';
import { RPS } from '../rps';

interface Opts {
  against: GuildMember;
}

const rps: Command.Fn<Opts> = async ({
  opts,
  member,
  channel,
  interaction,
}) => {
  const game = new RPS({
    channel,
    interaction,
    player1: member,
    player2: opts.against,
  });

  await game.start();
};

// rps.description = 'Starts a Rock-Paper-Scissors game.';
// rps.options = [
//   {
//     name: 'against',
//     description: 'The member to play against.',
//     type: 'USER',
//     required: true,
//   },
// ];

// leave disabled until `RPS` works
// export default rps;
export const __SKIP_FILE__ = true;
