import { code_block } from 'support/string';
import { time_ago_in_words } from 'support/time';
import { BackupJoinDateResource, UserHook } from '..';

type Event = 'guildMemberAdd';
type Details = 'age' | 'user_id';
type JoinHook = UserHook<Event, Details, Config>;

interface Config {
  join_dates?: BackupJoinDateResource;
}

export const log_joins: JoinHook = async ({ embed, event: [member], config }) => {
  await config?.join_dates?.add_backup(member.id, member.joinedAt);

  embed
    .by_default((e) => {
      e.color('info').title('Member Joined').author_user(member.user);
    })
    .detail('age', (e) => {
      e.field('Account Age', time_ago_in_words(member.user.createdAt));
    })
    .detail('user_id', (e) => {
      e.field('User ID', code_block(member.id));
    });
};

log_joins.on_event = 'guildMemberAdd';
