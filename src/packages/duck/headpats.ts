import { HeadpatCount } from '.prisma/client';
import { Guild, GuildMember } from 'discord.js';
import { HEADPAT_ASSETS } from 'porygon/assets';
import { database } from 'porygon/database';

export function getHeadpatGif() {
  return HEADPAT_ASSETS.random().url;
}

export async function incrementHeadpatCount({ id }: GuildMember, by = 1) {
  await database.$executeRaw`
    INSERT INTO
      "public"."HeadpatCount" ("userId", "headpats")
    VALUES
      (${id}, ${by})
    ON CONFLICT ON CONSTRAINT
      "HeadpatCount_pkey"
    DO UPDATE
    SET  "headpats" = (
      "HeadpatCount"."headpats" + "excluded"."headpats"
    )
  `;
}

export async function* getHeadpatLeaderboard(guild: Guild) {
  const entries = await fetchLeaderboard();
  const members = await Promise.all(
    entries.map(({ userId }) => guild.members.fetch(userId).catch(() => null)),
  );

  for (let i = 0; i < entries.length; i++) {
    const member = members[i];
    const headpats = entries[i].headpats;

    if (member && headpats) {
      yield { member, headpats };
    }
  }
}

function fetchLeaderboard() {
  return database.$queryRaw<HeadpatCount[]>`
    SELECT
      "userId",
      "headpats"
    FROM
      "public"."HeadpatCount"
    ORDER BY
      "headpats" DESC
    LIMIT
      10
  `;
}
