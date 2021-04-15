import { GuildMember } from 'discord.js';
import { Command } from 'interaction/command';
import { RPS } from '../models/rps';

interface Args {
  against: GuildMember;
}

const rps: Command<Args> = async ({ opts, member, channel, interaction }) => {
  const game = new RPS({
    channel,
    interaction,
    player1: member,
    player2: opts.against,
  });

  await game.start();
};

rps.description = 'Starts a Rock-Paper-Scissors game.';
rps.options = [
  {
    name: 'against',
    description: 'The member to play against.',
    type: 'USER',
    required: true,
  },
];

// leave disabled until `RPS` works
// export default rps;
export const skipFile = true;
export const __SKIP_FILE__ = true;
