import { format as formatWith, formatDistance } from 'date-fns';
import {
  Guild,
  GuildAuditLogsEntry,
  GuildMember,
  GuildBan,
  PartialGuildMember,
  TextChannel,
} from 'discord.js';
import { latestAuditLog } from 'porygon/audit_logs';
import { Embed } from 'porygon/embed';
import { EventHandler } from 'porygon/package';
import { setting } from 'porygon/settings';
import { missedPartialLeaves } from 'porygon/stats';
import { codeBlock, italics } from 'support/format';

const LOG_CHANNEL_ID = setting('pkg.pokecom.logging.log_channel');
const WARN_CHANNEL_ID = setting('pkg.pokecom.logging.warning_channel');
const NO_REASON = italics('(no reason given)');

const memberEventsHandler: EventHandler = ({ events }) => {
  events
    .on('guildMemberAdd', onAdd)
    .on('guildMemberRemove', onRemove)
    .on('guildBanAdd', onBanned)
    .on('guildBanRemove', onUnbanned);
};

export default memberEventsHandler;

function onAdd(member: GuildMember) {
  const embed = new Embed();

  embed
    .infoColor()
    .setAuthorFromUser(member, { withDiscriminator: true })
    .setTitle('Member Joined')
    .addField('Account Age', timeAgo(member.user.createdAt))
    .addField('ID', codeBlock(member.user.id));

  logChannel(member.guild).send(embed);
}

async function onRemove(member: GuildMember | PartialGuildMember) {
  if (member.partial) {
    missedPartialLeaves.fail();
    return;
  }

  missedPartialLeaves.succeed();

  const kick = await latestAuditLog(member.guild, 'MEMBER_KICK');
  kick ? onKicked(member, kick) : onLeave(member);
}

function onLeave(member: GuildMember) {
  const embed = new Embed();

  embed
    .warningColor()
    .setAuthorFromUser(member, { withDiscriminator: true })
    .setTitle('Member Left')
    .if(member.joinedAt, (date) => embed.addField('Joined At', codeBlock(date)))
    .addField('ID', codeBlock(member.user.id));

  logChannel(member.guild).send(embed);
}

function onKicked(member: GuildMember, kick: GuildAuditLogsEntry) {
  const embed = new Embed();
  const { guild } = member;

  embed
    .dangerColor()
    .setAuthorFromUser(member, { withDiscriminator: true })
    .setTitle(
      `${member.user.username} was kicked by ${kick.executor?.username}`,
    )
    .addField('Reason', kick.reason ?? NO_REASON)
    .if(member.joinedAt, (date) => embed.addField('Joined At', format(date)));

  logChannel(guild).send(embed);
  warnChannel(guild).send(embed);
}

async function onBanned(ban: GuildBan) {
  const log = await latestAuditLog(ban.guild, 'MEMBER_BAN_ADD');
  const executor = log?.executor?.username ?? '(unknown)';
  const embed = new Embed();

  embed
    .errorColor()
    .setAuthorFromUser(ban.user, { withDiscriminator: true })
    .setTitle(`${ban.user.username} was banned by ${executor}`)
    .addField('Reason', ban.reason ?? NO_REASON);

  logChannel(ban.guild).send(embed);
  warnChannel(ban.guild).send(embed);
}

async function onUnbanned(ban: GuildBan) {
  const log = await latestAuditLog(ban.guild, 'MEMBER_BAN_REMOVE');
  const executor = log?.executor?.username ?? '(unknown)';
  const embed = new Embed();

  embed
    .okColor()
    .setAuthorFromUser(ban.user, { withDiscriminator: true })
    .setTitle(`${ban.user.username} was unbanned by ${executor}`);

  logChannel(ban.guild).send(embed);
  warnChannel(ban.guild).send(embed);
}

function logChannel(guild: Guild) {
  return guild.channels.cache.get(LOG_CHANNEL_ID.value) as TextChannel;
}

function warnChannel(guild: Guild) {
  return guild.channels.cache.get(WARN_CHANNEL_ID.value) as TextChannel;
}

function timeAgo(from: Date) {
  return formatDistance(from, new Date());
}

function format(date: Date) {
  return formatWith(date, 'E, dd MMM yyyy hh:mm b');
}
