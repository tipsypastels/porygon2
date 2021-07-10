import { GuildMember } from 'discord.js';
import { CommandFn, LocalCommand } from 'porygon/interaction';
import { random } from 'support/array';

interface Opts {
  member: GuildMember;
}

const hug: CommandFn<Opts> = async ({ opts, embed, author }) => {
  const subject = opts.member;
  const isSelf = author.id === subject.id;
  const subjectLine = isSelf ? 'themself' : subject.displayName;

  const stat = random(STATS);

  await embed
    .okColor()
    .setTitle(`${author.displayName} hugs ${subjectLine}!`)
    .setDescription(`:hugging: ${subject.displayName}'s ${stat} rose!`)
    .reply();
};

export default new LocalCommand(hug, {
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
