import { add_command, UserCommand } from 'core/command';
import { DUCK } from 'core/controller';
import { random } from 'support/array';

const hug: UserCommand = async ({ embed, author, subject, is_self }) => {
  const subject_line = is_self ? 'themself' : subject.displayName;

  const stat = random(STATS);

  embed
    .color('ok')
    .title(`${author.displayName} hugs ${subject_line}!`)
    .about(`:hugging: ${subject.displayName}'s ${stat} rose!`);
};

add_command(DUCK, hug, {
  name: 'Give a Hug',
  type: 'USER',
});

const STATS = ['Attack', 'Defense', 'Speed', 'Special Attack', 'Special Defense', 'HP'];
