import { add_command, ChatCommand } from 'core/command';
import { DUCK } from 'core/controller';
import { random } from 'support/array';

const hug: ChatCommand = async ({ embed, author, opts }) => {
  const subject = opts.member('member');
  const is_self = author.id === subject.id;
  const subject_line = is_self ? 'themself' : subject.displayName;

  const stat = random(STATS);

  embed
    .color('ok')
    .title(`${author.displayName} hugs ${subject_line}!`)
    .about(`:hugging: ${subject.displayName}'s ${stat} rose!`);
};

add_command(DUCK, hug, {
  name: 'hug',
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

const STATS = ['Attack', 'Defense', 'Speed', 'Special Attack', 'Special Defense', 'HP'];
