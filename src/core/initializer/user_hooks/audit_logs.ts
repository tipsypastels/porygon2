import { logger } from 'core/logger';
import {
  Guild,
  GuildAuditLogsEntry as Entry,
  GuildAuditLogsResolvable as Type,
  User,
} from 'discord.js';
import { sleep } from 'support/async';
import { plural } from 'support/string';
import { Seconds } from 'support/time';

interface Target {
  user: User;
  guild: Guild;
}

const RETRIES = 3;
const SLEEP = Seconds(5);

/**
 * Last time an event was found. Prevents finding the same event twice.
 * In staging, because we're pretending to be multiple servers at once, it means
 * that if multiple user hooks are listening to the same event which fetches an
 * audit log, only one of them will get it. This is fine, just something to
 * remember.
 */
let last_find = Date.now();

/**
 * Fetches a single audit log for a user. They are fickle creatures, appearing
 * right away or not at all or sometimes just in their own time, and must be
 * treated with respect and adoration. In practice, that means trying a *bunch*
 * of times when we're looking for one. This would be completely unacceptable
 * as a response to a command, but since user hooks are mere passive logging
 * it's acceptable to delay a bit and ponder the majesty of the audit log.
 *
 * Ban audit logs seem to be particularly unconcerned with showing up on schedule,
 * while unbans and kicks at least usually make it to class before the second bell.
 */
export async function latest_audit_log<T extends Type>(target: Target, type: T) {
  for (let i = 0; i < RETRIES; i++) {
    const log = await get(target, type);

    if (log) {
      logger.debug(`Found audit log %${type}% after %${plural(i, 'cycle')}%`);
      return log;
    }

    if (i < RETRIES - 1) {
      await sleep(SLEEP);
    }
  }
}

async function get<T extends Type>({ user, guild }: Target, type: T) {
  const logs = await guild.fetchAuditLogs({ type, limit: 1 });
  const entry = logs.entries.first();

  if (entry && is_user(user, entry) && is_recent(entry)) {
    return entry;
  }
}

function is_user(user: User, { target }: Entry<any>) {
  if (!target || !('id' in target)) {
    return false;
  }

  return user.id === target.id;
}

function is_recent({ createdTimestamp: ts }: Entry<any>) {
  if (ts > last_find) {
    last_find = ts;
    return true;
  }

  return false;
}
