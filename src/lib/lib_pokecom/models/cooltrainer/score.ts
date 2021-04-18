import { CtScore } from '.prisma/client';
import { GuildMember } from 'discord.js';
import { database } from 'porygon/database';
import { CtSettings } from './settings';

const table = database.ctScore;

export enum CtRoleState {
  Yes = '✅ Yes.',
  No = '❌ No.',
  WillRemove = '🕒 Yes. Will be removed next tick due to decreasing score.',
  WillAdd = '🕒 No. Will be added next tick due to increasing score.',
}

export interface CtScoreSummary {
  score: number;
  hasRole: CtRoleState;
}

export class CtScoreManager {
  static increment(member: GuildMember, amount: number) {
    return new this(member).increment(amount);
  }

  static fetchSummary(member: GuildMember) {
    return new this(member).fetchSummary();
  }

  constructor(readonly member: GuildMember) {}

  increment(amount: number) {
    return database.$executeRaw`
      INSERT INTO 
        "public"."CtScore" ("userId", "pointsThisCycle")
      VALUES 
        (${this.member.id}, ${amount})
      ON CONFLICT ON CONSTRAINT 
        "CtScore_pkey" 
      DO UPDATE
      SET "pointsThisCycle" = (
        "CtScore"."pointsThisCycle" + "excluded"."pointsThisCycle"
      )
    `;
  }

  fetch() {
    return this.fetchEntry().then((e) => this.sumPoints(e));
  }

  async fetchSummary(): Promise<CtScoreSummary> {
    const score = await this.fetch();
    const hasRole = this.hasRole();
    const aboveThreshold = this.aboveThreshold(score);

    return {
      score,
      hasRole: this.computeRoleState(hasRole, aboveThreshold),
    };
  }

  private sumPoints(entry: CtScore | null) {
    return entry ? entry.pointsThisCycle + entry.pointsPrevCycle : 0;
  }

  private fetchEntry() {
    return table.findFirst({ where: { userId: this.member.user.id } });
  }

  private aboveThreshold(points: number) {
    return points >= CtSettings.threshold.value;
  }

  private hasRole() {
    return this.member.roles.cache.has(CtSettings.roleId.value);
  }

  private computeRoleState(hasRole: boolean, aboveThreshold: boolean) {
    if (hasRole && aboveThreshold) return CtRoleState.Yes;
    if (hasRole && !aboveThreshold) return CtRoleState.WillRemove;
    if (!hasRole && aboveThreshold) return CtRoleState.WillAdd;
    return CtRoleState.No;
  }
}
