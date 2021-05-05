import { subMinutes } from 'date-fns';
import { Guild, GuildAuditLogsFetchOptions } from 'discord.js';

type Type = GuildAuditLogsFetchOptions['type'];

export async function latestAuditLog(guild: Guild, type: Type) {
  const logs = await guild.fetchAuditLogs({
    type,
    limit: 1,
  });

  const entry = logs.entries.first();

  if (entry && entry.createdTimestamp >= minTime()) {
    return entry;
  }
}

function minTime() {
  return subMinutes(new Date(), 3).getTime();
}
