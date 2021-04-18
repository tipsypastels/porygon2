import { Guild, GuildMember, Role } from 'discord.js';
import { database } from 'porygon/database';
import { CtSettings } from './settings';
import { Prisma } from '@prisma/client';
import { logger } from 'porygon/logger';

type Filter = 'above' | 'below';
type EachMember = (member: GuildMember) => void;

export class CtTickRunner {
  static async run(guild: Guild) {
    const manager = await this.init(guild);
    await manager.run();
  }

  static async init(guild: Guild) {
    const role = await guild.roles.fetch(CtSettings.roleId.value);

    if (!role) {
      throw new Error('Cooltrainer role not found.');
    }

    return new this(guild, role);
  }

  private constructor(private guild: Guild, private role: Role) {}

  run() {
    return Promise.all([this.give(), this.take()]);
  }

  private async give() {
    await this.eachMember('above', async (member) => {
      if (member.roles.cache.has(this.role.id)) return;
      await member.roles.add(this.role);

      logger.task(`${member.user.username} earned COOLTRAINER.`);
    });
  }

  private async take() {
    await this.eachMember('below', async (member) => {
      if (!member.roles.cache.has(this.role.id)) return;
      await member.roles.remove(this.role);

      logger.task(`${member.user.username} lost COOLTRAINER.`);
    });
  }

  private async eachMember(filter: Filter, each: EachMember) {
    const entries = await this.query(filter);
    const promises = entries.map(async ({ userId }) => {
      const member = await this.fetchMember(userId);

      if (member) {
        await each(member);
      }
    });

    await Promise.all(promises);
  }

  private query(filter: Filter) {
    const op = filter === 'above' ? '>' : '<';
    const threshold = CtSettings.threshold.value;

    return database.$queryRaw<{ userId: string }[]>`
      SELECT 
        "userId"
      FROM
        "public"."CtScore"
      WHERE
        "pointsThisCycle" + "pointsPrevCycle" ${Prisma.raw(op)} ${threshold}
    `;
  }

  private fetchMember(userId: string) {
    return this.guild.members.fetch(userId).catch(() => null);
  }
}
