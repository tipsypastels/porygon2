import { Guild } from 'discord.js';
import { database } from 'porygon/database';
import { CtTickRunner } from './tick';

export class CtCycleRunner {
  static run(guild: Guild) {
    return new this(guild).run();
  }

  constructor(private guild: Guild) {}

  async run() {
    await database.$executeRaw`
      UPDATE 
        "public"."CtScore"
      SET 
        "pointsPrevCycle" = "pointsThisCycle",
        "pointsThisCycle" = 0 
    `;

    await CtTickRunner.run(this.guild);
  }
}
