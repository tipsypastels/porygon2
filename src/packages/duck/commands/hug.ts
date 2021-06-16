import { GuildMember } from 'discord.js';
import { Command } from 'porygon/interaction';
import { random } from 'support/array';

interface Opts {
  member: GuildMember;
}

const hug: Command.Fn<Opts> = async ({ opts, embed, member: actor }) => {
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

export default new Command(hug, {
  description: 'Hugs a friend.',
  options: [
    {
      name: 'member',
      type: 'USER',
      description: 'The member to hug.',
      required: true,
    },
  ],
});

const STATS = [
  'Attack',
  'Defense',
  'Speed',
  'Special Attack',
  'Special Defense',
  'HP',
];
