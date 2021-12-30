import { logger } from 'core/logger';
import { GuildMember, PartialGuildMember, User, GuildAuditLogsEntry } from 'discord.js';
import { noop } from 'support/fn';
import { map_maybe, Maybe } from 'support/null';
import { code_block } from 'support/string';
import { event_time } from 'support/time';
import { UserHook } from '..';
import { latest_audit_log } from '../audit_logs';
import { BackupJoinDateResource } from '../backup_join_date';
import { HookEmbed } from '../hook_embed';

type Event = 'guildMemberRemove';
type Details = 'joined_at' | 'user_id';
type LeaveHook = UserHook<Event, Details, Config>;

interface Config {
  join_dates?: BackupJoinDateResource;
}

type Memberish = GuildMember | PartialGuildMember;
type Embed = HookEmbed<Details>;
type Entry = GuildAuditLogsEntry<'MEMBER_KICK'>;

interface ErsatzMember {
  id: string;
  user: User;
  joinedAt: Maybe<Date>;
}

export const log_leaves: LeaveHook = async ({ embed, event: [member_data], config }) => {
  const member = await resolve(member_data, config);
  if (!member) return logger.warn(`No user data for leaving user %${member_data.id}%`);

  await config?.join_dates?.remove_backup(member.id);

  const kick = await latest_audit_log(member, 'MEMBER_KICK');
  return kick ? kicked(member, kick, embed) : left(member, embed);
};

log_leaves.on_event = 'guildMemberRemove';

function left(member: ErsatzMember, embed: Embed) {
  embed
    .by_default((e) => {
      e.color('warning').title('Member Left').author_user(member.user);
    })
    .merge(shared, member);
}

function kicked(member: ErsatzMember, log: Entry, embed: Embed) {
  const mod = log.executor?.username ?? '(unknown)';

  embed
    .by_default((e) => {
      e.color('danger')
        .title(`${member.user.username} was kicked by ${mod}`)
        .field('Reason', log.reason ?? '_(no reason given)_')
        .author_user(member.user);
    })
    .merge(shared, member);

  return 'kicked';
}

function shared(embed: HookEmbed<Details>, { id, joinedAt: joined_at }: ErsatzMember) {
  embed
    .detail('joined_at', (e) => {
      e.field('Joined At', map_maybe(event_time, joined_at) ?? 'Unknown');
    })
    .detail('user_id', (e) => {
      e.field('User ID', code_block(id));
    });
}

async function resolve(member: Memberish, { join_dates }: Config) {
  const { id, guild, client } = member;

  if (member.partial) {
    const fetch_user = client.users.fetch(id).catch(noop);
    const fetch_join_date = join_dates?.fetch(id);
    const [user, joined_at] = await Promise.all([fetch_user, fetch_join_date]);

    if (!user) return;

    join_dates?.stat?.(joined_at ? 'backup' : 'missing');
    return { id, guild, user, joinedAt: joined_at };
  }

  join_dates?.stat?.('memory');
  return member;
}
