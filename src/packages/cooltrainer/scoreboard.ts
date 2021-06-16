import { Guild } from 'discord.js';
import { database } from 'porygon/database';

interface Entry {
  userId: string;
  score: number;
}

export class CtScoreboard {
  constructor(private guild: Guild) {}

  async *[Symbol.asyncIterator]() {
    const entries = await this.fetch();
    const members = await Promise.all(
      entries.map(({ userId }) => this.fetchMember(userId)),
    );

    for (let i = 0; i < entries.length; i++) {
      const member = members[i];
      const score = entries[i].score;

      if (member && score) {
        yield { member, score };
      }
    }
  }

  private fetch() {
    return database.$queryRaw<Entry[]>`
      SELECT
        "userId",
        "pointsPrevCycle" + "pointsThisCycle" as "score"
      FROM
        "public"."CtScore"
      ORDER BY
        "score" DESC
      LIMIT
        10
    `;
  }

  private fetchMember(userId: string) {
    return this.guild.members.fetch(userId).catch(() => null);
  }
}
