import { format as formatWith, formatDistance } from 'date-fns';
import {
  Guild,
  GuildAuditLogsEntry,
  GuildMember,
  PartialGuildMember,
  TextChannel,
  User,
} from 'discord.js';
import { GuildHandler } from 'lib/lib/event';
import { latestAuditLog } from 'porygon/audit_logs';
import { PorygonEmbed } from 'porygon/embed';
import { setting } from 'porygon/settings';
import { missedPartialLeaves } from 'porygon/stats';
import { codeBlock, italics } from 'support/format';

const LOG_CHANNEL_ID = setting('lib.pokecom.logging.log_channel');
const WARN_CHANNEL_ID = setting('lib.pokecom.logging.warning_channel');
const NO_REASON = italics('(no reason given)');

const memberEventsHandler: GuildHandler = ({ em }) => {
  em.on('guildMemberAdd', onAdd)
    .on('guildMemberRemove', onRemove)
    .on('guildBanAdd', onBanned)
    .on('guildBanRemove', onUnbanned);
};

export default memberEventsHandler;

function onAdd(member: GuildMember) {
  const embed = new PorygonEmbed();

  embed
    .infoColor()
    .setAuthor(member.user, { withDisciminator: true })
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
  const embed = new PorygonEmbed();

  embed
    .warningColor()
    .setAuthor(member.user, { withDisciminator: true })
    .setTitle('Member Left')
    .addFieldIfPresent('Joined At', format(member.joinedAt))
    .addField('ID', codeBlock(member.user.id));

  logChannel(member.guild).send(embed);
}

function onKicked(member: GuildMember, kick: GuildAuditLogsEntry) {
  const embed = new PorygonEmbed();
  const { guild } = member;

  embed
    .dangerColor()
    .setAuthor(member.user, { withDisciminator: true })
    .setTitle(`${member.user.username} was kicked by ${kick.executor.username}`)
    .addField('Reason', kick.reason ?? NO_REASON)
    .addFieldIfPresent('Joined At', format(member.joinedAt));

  logChannel(guild).send(embed);
  warnChannel(guild).send(embed);
}

async function onBanned(guild: Guild, user: User) {
  const ban = await latestAuditLog(guild, 'MEMBER_BAN_ADD');
  const executor = ban?.executor.username ?? '(unknown)';
  const embed = new PorygonEmbed();

  embed
    .errorColor()
    .setAuthor(user, { withDisciminator: true })
    .setTitle(`${user.username} was banned by ${executor}`)
    .addField('Reason', ban?.reason ?? NO_REASON);

  logChannel(guild).send(embed);
  warnChannel(guild).send(embed);
}

async function onUnbanned(guild: Guild, user: User) {
  const unban = await latestAuditLog(guild, 'MEMBER_BAN_REMOVE');
  const executor = unban?.executor.username ?? '(unknown)';
  const embed = new PorygonEmbed();

  embed
    .okColor()
    .setAuthor(user, { withDisciminator: true })
    .setTitle(`${user.username} was unbanned by ${executor}`);

  logChannel(guild).send(embed);
  warnChannel(guild).send(embed);
}

function logChannel(guild: Guild) {
  return guild.channels.cache.get(LOG_CHANNEL_ID.value) as TextChannel;
}

function warnChannel(guild: Guild) {
  return guild.channels.cache.get(WARN_CHANNEL_ID.value) as TextChannel;
}

function timeAgo(from: Date | null) {
  if (from) {
    return formatDistance(from, new Date());
  }
}

function format(date: Date | null) {
  if (date) {
    return formatWith(date, 'E, dd MMM yyyy hh:mm b');
  }
}
