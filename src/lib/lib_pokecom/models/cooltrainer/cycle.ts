import { Guild } from 'discord.js';
import { database } from 'porygon/database';
import { logger } from 'porygon/logger';
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

    logger.task('COOLTRAINER has been cycled! Running a tick now...');

    await CtTickRunner.run(this.guild);
  }
}
