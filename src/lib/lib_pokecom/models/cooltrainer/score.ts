import { GuildMember } from 'discord.js';
import { database } from 'porygon/database';

const table = database.cooltrainerScore;

export function incrementCooltrainerScore(member: GuildMember, amount: number) {
  return database.$executeRaw`
    INSERT INTO "public"."CooltrainerScore" ("CooltrainerScore"."guildId", "CooltrainerScore"."userId", "CooltrainerScore"."pointsThisCycle")
    VALUES (${member.guild.id}, ${member.id}, ${amount})
    ON CONFLICT ON CONSTRAINT "CooltrainerScore_pkey" DO UPDATE
    SET "CooltrainerScore"."pointsThisCycle" = (
      "CooltrainerScore"."pointsThisCycle" + "excluded"."pointsThisCycle"
    )
  `;
}
