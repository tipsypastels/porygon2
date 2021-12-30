import { POKECOM } from 'core/controller';
import {
  add_init,
  add_task,
  add_user_hook,
  Initializer,
  JoinDateSourceStat as SourceStat,
  JOIN_DATE_SOURCE_STATS as SOURCE_STATS,
  log_bans,
  log_deletions,
  log_joins,
  log_leaves,
  log_unbans,
  Task,
  UserHookTag,
} from 'core/initializer';
import { staging } from 'support/env';
import { Cache } from 'support/cache';
import { $db } from 'core/db';
import { Seconds } from 'support/time';
import { Guild } from 'discord.js';
import { Maybe } from 'support/null';
import { noop } from 'support/fn';
import { logger } from 'core/logger';
import { each_member_batch } from 'core/guild';
import { PokecomJoinDate } from '@prisma/client';
import { panic_assert } from 'core/assert';
import { sleep } from 'support/async';
import { TimeDifference } from 'core/stat/time';
import { inline_code } from 'support/string';

console.log(__dirname);

/* -------------------------------------------------------------------------- */
/*                                    Hooks                                   */
/* -------------------------------------------------------------------------- */

const LOGS = staging('925944733535195147', '423905036859604993');
const WARNS = staging('925944747955196004', '613756774234718209');
const BOTH = [LOGS, WARNS];
const BOTH_IF_KICK = (tag: UserHookTag) => (tag === 'kicked' ? BOTH : LOGS);

const RESOURCE = { fetch, stat, add_backup, remove_backup };

add_user_hook(POKECOM, log_bans, { to: BOTH, details: 'all' });
add_user_hook(POKECOM, log_unbans, { to: BOTH, details: 'all' });
add_user_hook(POKECOM, log_deletions, { to: LOGS, details: 'all' });

add_user_hook(POKECOM, log_joins, {
  to: LOGS,
  details: 'all',
  config: { join_dates: RESOURCE },
});

add_user_hook(POKECOM, log_leaves, {
  to: BOTH_IF_KICK,
  details: 'all',
  config: { join_dates: RESOURCE },
});

/* -------------------------------------------------------------------------- */
/*                            Tasks & Initializers                            */
/* -------------------------------------------------------------------------- */

const cache_join_dates_init: Initializer = async ({ guild }) => {
  panic_assert(guild, "Can't cache join dates under %GLOBAL%!");

  await sleep(DELAY_UNTIL_MEMBER_LIST_IS_ACCURATE);

  logger.info('Building the cached join date list for %PokéCommunity% now...');

  const timer = TimeDifference.start_timing();
  const { member_count, new_inserts } = await cache_all_join_dates(guild);
  const time = timer.in_words();

  logger.info(
    `Cached %${member_count} (${new_inserts} new)% join dates. Process took ${time}`,
  );
};

add_init(POKECOM, cache_join_dates_init, { name: 'cache_pc_join_dates_init' });

const reload_join_dates: Task = async ({ guild }) => {
  panic_assert(guild, "Can't cache join dates under %GLOBAL%!");
  await TABLE.deleteMany().then(() => cache_all_join_dates(guild));
};

add_task(POKECOM, reload_join_dates, {
  name: 'reload_pc_join_dates',
  run_at: '0 0 * * MON',
});

/* -------------------------------------------------------------------------- */
/*                                   Exports                                  */
/* -------------------------------------------------------------------------- */

/**
 * Returns a string representation of PokéCommunity's join date sources in
 * the server's implementation of `BackupJoinDateResource`.
 *
 * Used in `/op stats`.
 */
export async function get_pokecom_join_date_source_stats() {
  const count = await TABLE.count();
  const display = (s: SourceStat) => `${SOURCE_SYMBOLS[s]} ${JOIN_DATE_STATS.get(s)}`;
  const sources = inline_code(SOURCE_STATS.map(display).join(' '));
  return `**Sources:** ${sources}\n**Table size:** ${count}`;
}

const SOURCE_SYMBOLS = {
  memory: '🧠',
  backup: '💽',
  missing: '❓',
};

/* -------------------------------------------------------------------------- */
/*                               Implementation                               */
/* -------------------------------------------------------------------------- */

const DELAY_UNTIL_MEMBER_LIST_IS_ACCURATE = Seconds(staging(0, 30));
const JOIN_DATE_STATS = new Cache<SourceStat, number>(() => 0);
const TABLE = $db.pokecomJoinDate;

function fetch(user_id: string) {
  return TABLE.findFirst({ where: { user_id } }).then((x) => x?.joined_at);
}

function stat(stat: SourceStat) {
  JOIN_DATE_STATS.update(stat, (x) => x + 1);
}

async function add_backup(user_id: string, joined_at: Maybe<Date>) {
  if (joined_at) {
    logger.debug(`Backing up join date of user %${user_id}%`);
    const where = { user_id };
    const update = { joined_at };
    const create = { joined_at, user_id };
    await TABLE.upsert({ where, update, create });
  }
}

async function remove_backup(user_id: string) {
  logger.debug(`Removing backed-up join date of user %${user_id}%`);
  await TABLE.delete({ where: { user_id } }).then(noop);
}

async function cache_all_join_dates(guild: Guild) {
  let new_inserts = 0;

  const counters = await each_member_batch(guild, async (members) => {
    const data: PokecomJoinDate[] = [];

    for (const [, member] of members) {
      if (member.joinedAt) {
        data.push({ joined_at: member.joinedAt, user_id: member.id });
      }
    }

    const { count } = await TABLE.createMany({ data, skipDuplicates: true });
    new_inserts += count;
  });

  return { ...counters, new_inserts };
}
