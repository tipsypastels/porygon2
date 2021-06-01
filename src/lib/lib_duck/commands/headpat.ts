import { GuildMember } from 'discord.js';
import { Command, CommandFn } from 'interaction/command';
import { disambiguate } from 'interaction/command/disambiguate';
import {
  getHeadpatGif,
  getHeadpatLeaderboard,
  incrementHeadpatCount,
} from '../models/headpats';

type MemberOpts = { for: { member: GuildMember } };
type LeaderboardOpts = { leaderboard: never };
type Args = MemberOpts | LeaderboardOpts;

const headpat: Command<Args> = async (args) => {
  return disambiguate(args, {
    for: headpatMember,
    leaderboard: headpatLeaderboard,
  });
};

const headpatMember: CommandFn<MemberOpts> = async ({
  opts,
  embed,
  member: author,
}) => {
  const { member } = opts.for;

  if (member.id !== author.id) {
    incrementHeadpatCount(member);

    embed.setFooter('+1 headpat score!');
  }

  await embed
    .okColor()
    .setDescription(`${member} has been headpat!`)
    .setImage(getHeadpatGif())
    .reply();
};

const headpatLeaderboard: CommandFn<LeaderboardOpts> = async ({
  embed,
  guild,
}) => {
  const leaderboard = getHeadpatLeaderboard(guild);

  for await (const { member, headpats } of leaderboard) {
    embed.addField(member.displayName, headpats);
  }

  embed.infoColor().setTitle('Headpats Received').reply();
};

headpat.description = '*headpats*';
headpat.options = [
  {
    name: 'for',
    type: 'SUB_COMMAND',
    description: 'Headpats a member.',
    options: [
      {
        name: 'member',
        type: 'USER',
        description: 'The member to headpat.',
        required: true,
      },
    ],
  },
  {
    name: 'leaderboard',
    type: 'SUB_COMMAND',
    description: 'Shows the most headpatted members.',
  },
];

export default headpat;
