import { add_command, ChatCommand, UserCommand } from 'core/command';
import { DUCK } from 'core/controller';
import { Embed } from 'core/embed';
import { GuildMember } from 'discord.js';
import { random } from 'support/array';

const hug_context_menu: UserCommand = async (args) => {
  return hug_inner(args);
};

const hug_chat_command: ChatCommand = async ({ embed, author, opts }) => {
  const subject = opts.member('friend');
  const is_self = subject.id === author.id;
  return hug_inner({ embed, author, subject, is_self });
};

add_command(DUCK, hug_context_menu, { name: 'Give a Hug', type: 'USER' });
add_command(DUCK, hug_chat_command, {
  name: 'hug',
  description: 'Gives a hug to a friend.',
  options: [
    { name: 'friend', description: 'The friend to hug.', type: 'USER', required: true },
  ],
});

const STATS = ['Attack', 'Defense', 'Speed', 'Special Attack', 'Special Defense', 'HP'];

/* -------------------------------------------------------------------------- */
/*                                    Inner                                   */
/* -------------------------------------------------------------------------- */

interface Inner {
  embed: Embed;
  author: GuildMember;
  subject: GuildMember;
  is_self: boolean;
}

async function hug_inner({ embed, author, subject, is_self }: Inner) {
  const subject_line = is_self ? 'themself' : subject.displayName;

  const stat = random(STATS);

  embed
    .color('ok')
    .title(`${author.displayName} hugs ${subject_line}!`)
    .about(`:hugging: ${subject.displayName}'s ${stat} rose!`);
}
