import { User } from 'discord.js';
import { code_block, italics } from 'support/string';
import { UserHook } from '..';
import { latest_audit_log } from '../audit_logs';
import { HookEmbed } from '../hook_embed';

type BanEvent = 'guildBanAdd';
type UnbanEvent = 'guildBanRemove';
type Details = 'user_id';
type BanHook<E extends BanEvent | UnbanEvent> = UserHook<E, Details>;

const UNKNOWN = '(unknown)';
const NO_REASON = italics('(no reason given)');

export const log_bans: BanHook<BanEvent> = async ({ embed, event: [ban] }) => {
  const log = await latest_audit_log(ban, 'MEMBER_BAN_ADD');
  const mod = log?.executor?.username ?? UNKNOWN;

  // in theory these should be the same, but the discord API is nothing
  // if not consistently inconsistent. so it's always good to have backups
  const reason = log?.reason ?? ban.reason ?? NO_REASON;
  const { user } = ban;

  embed
    .by_default((e) => {
      e.color('error')
        .title(`${user.username} was banned by ${mod}`)
        .field('Reason', reason)
        .author_user(user, { discriminator: true });
    })
    .merge(shared, user);
};

log_bans.on_event = 'guildBanAdd';

export const log_unbans: BanHook<UnbanEvent> = async ({ embed, event: [ban] }) => {
  const log = await latest_audit_log(ban, 'MEMBER_BAN_REMOVE');
  const mod = log?.executor?.username ?? UNKNOWN;
  const { user } = ban;

  embed
    .by_default((e) => {
      e.color('ok').title(`${user.username} was unbanned by ${mod}`).author_user(user);
    })
    .merge(shared, user);
};

log_unbans.on_event = 'guildBanRemove';

function shared(embed: HookEmbed<Details>, user: User) {
  embed.detail('user_id', (e) => {
    e.field('User ID', code_block(user.id));
  });
}
