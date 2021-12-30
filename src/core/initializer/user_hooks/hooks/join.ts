import { code_block } from 'support/string';
import { time_ago_in_words } from 'support/time';
import { UserHook } from '..';

type Event = 'guildMemberAdd';
type Details = 'age' | 'user_id';

export const log_joins: UserHook<Event, Details> = ({ embed, event: [member] }) => {
  // TODO: author
  embed
    .by_default((e) => {
      e.color('info').title('Member Joined');
    })
    .detail('age', (e) => {
      e.field('Account Age', time_ago_in_words(member.user.createdAt));
    })
    .detail('user_id', (e) => {
      e.field('User ID', code_block(member.id));
    });
};

log_joins.on_event = 'guildMemberAdd';
