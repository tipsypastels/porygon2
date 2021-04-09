import { GuildMember } from 'discord.js';
import { Command } from 'interaction/command';
import { random } from 'support/array';

interface Args {
  member: GuildMember;
}

const hug: Command<Args> = ({ args, embed, reply }) => {
  const { displayName } = args.member;
  const stat = random(STATS);

  embed
    .okColor()
    .setTitle(`You hug ${displayName}!`)
    .setDescription(`:hugging: ${displayName}'s ${stat} rose!`);

  reply(embed);
};

hug.description = 'Hugs a friend.';
hug.options = [
  {
    name: 'member',
    type: 'USER',
    description: 'The member to hug.',
    required: true,
  },
];

export default hug;

const STATS = [
  'Attack',
  'Defense',
  'Speed',
  'Special Attack',
  'Special Defense',
  'HP',
];
