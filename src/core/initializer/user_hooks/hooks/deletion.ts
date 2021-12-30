import { code_block, italics } from 'support/string';
import { event_time } from 'support/time';
import { UserHook } from '..';

type Event = 'messageDelete';
type Details = 'channel' | 'sent_at' | 'msg_id' | 'user_id';

const NO_CONTENT = italics('(no content)');

export const log_deletions: UserHook<Event, Details> = ({ embed, event: [message] }) => {
  const { author } = message;
  if (!author || author.bot) return;

  embed
    .by_default((e) => {
      e.color('info')
        .title('Message Deleted')
        .about(message.content || NO_CONTENT)
        .author_user(author);
    })
    .detail('channel', (e) => {
      e.inline('Channel', message.channel.toString());
    })
    .detail('sent_at', (e) => {
      e.inline('Sent At', event_time(message.createdAt));
    })
    .detail('msg_id', (e) => {
      e.field('Message ID', code_block(message.id));
    })
    .detail('user_id', (e) => {
      e.field('User ID', code_block(author.id));
    });
};

log_deletions.on_event = 'messageDelete';
