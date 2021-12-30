import { Collection, Guild, GuildMember } from 'discord.js';
import { IntoVoid } from 'support/async';

type Callback<M> = (item: M, batck: number) => IntoVoid;
type BatchCallback = Callback<Collection<string, GuildMember>>;
type MemberCallback = Callback<GuildMember>;

/**
 * Iterates over every member of a guild in batches of 1000.
 */
export async function each_member_batch(guild: Guild, callback: BatchCallback) {
  let after: string | undefined;
  let member_count = 0;
  let batch_count = 0;

  for (;;) {
    const members = await guild.members.list({ limit: 1000, after });

    if (members.size === 0) {
      break;
    }

    batch_count++;

    await callback(members, batch_count);

    after = members.last()!.id; // safe because we just checked non-empty
    member_count += members.size;
  }

  return { member_count, batch_count };
}

/**
 * Iterates over every member of a guild. Probably slower than `each_member_batch`,
 * but what do I know! Not how to benchmark Javascript.
 *
 * This could in theory be faster by setting it up to do the next request *immediately*
 * before the iteration starts, or by saving all the `Promise.all`s to the end instead
 * of one per batch, but the former would add complexity and the second would leave
 * thousands of promises waiting in memory which I'm not sure would be better?
 */
export function each_member(guild: Guild, callback: MemberCallback) {
  return each_member_batch(guild, async (members, batch_count) => {
    const promises = members.map((member) => callback(member, batch_count));
    await Promise.all(promises);
  });
}
