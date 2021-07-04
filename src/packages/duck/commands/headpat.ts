import { GuildMember } from 'discord.js';
import { Command } from 'porygon/interaction';
import {
  getHeadpatGif,
  getHeadpatLeaderboard,
  incrementHeadpatCount,
} from '../headpats';

type MemberOpts = { member: GuildMember };
type LeaderboardOpts = { leaderboard: never };

const for_: Command.Fn<MemberOpts> = async ({
  opts,
  embed,
  member: author,
}) => {
  const { member } = opts;

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

const leaderboard: Command.Fn<LeaderboardOpts> = async ({ embed, guild }) => {
  const leaderboard = getHeadpatLeaderboard(guild);

  for await (const { member, headpats } of leaderboard) {
    embed.addField(member.displayName, headpats);
  }

  embed.infoColor().setTitle('Headpats Received').reply();
};

export default new Command.Multipart(
  { for: for_, leaderboard },
  {
    name: 'headpat',
    description: '*headpats*',
    options: [
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
    ],
  },
);
