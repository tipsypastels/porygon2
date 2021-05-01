import { GuildMember } from 'discord.js';
import { Command } from 'interaction/command';
import { random } from 'support/array';

interface Args {
  member: GuildMember;
}

const hug: Command<Args> = async ({ opts, embed, member: actor }) => {
  const subject = opts.member;
  const isSelf = actor.id === subject.id;
  const subjectLine = isSelf ? 'themself' : subject.displayName;

  const stat = random(STATS);

  await embed
    .okColor()
    .setTitle(`${actor.displayName} hugs ${subjectLine}!`)
    .setDescription(`:hugging: ${subject.displayName}'s ${stat} rose!`)
    .reply();
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
