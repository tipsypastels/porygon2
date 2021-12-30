import { Awaitable, IntoVoid } from 'support/async';
import { Maybe } from 'support/null';

/**
 * A cache of join dates that can be queried to supplement data missing from
 * the in memory one when handling member leave/kick events.
 *
 * Since user hooks are meant to be generic, this is just an interface and
 * does not specify any implementation of how the backup data should work.
 *
 * In practice, PokéCommunity is the only consumer of this API, but we keep
 * it seperate here to avoid weaving together different levels of abstraction.
 *
 * Also we might want to use it elsewhere in the future ¯\_(ツ)_/¯.
 */
export interface BackupJoinDateResource {
  fetch(user_id: string): Awaitable<Maybe<Date>>;
  add_backup(user_id: string, joined_at: Maybe<Date>): IntoVoid;
  remove_backup(user_id: string): IntoVoid;
  stat?(stat: JoinDateSourceStat): void;
}

/**
 * The sources where a join date may come from.
 *
 * Implementations of `BackupJoinDateResource` may track this to use in
 * stat dashboards.
 */
export type JoinDateSourceStat = typeof JOIN_DATE_SOURCE_STATS[number];

/**
 * @see JoinDateSourceStat
 */
export const JOIN_DATE_SOURCE_STATS = <const>['memory', 'backup', 'missing'];
