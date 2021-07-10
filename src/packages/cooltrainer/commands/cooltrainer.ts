import { GuildMember } from 'discord.js';
import { CommandFn, LocalMultipartCommand } from 'porygon/interaction';
import { isDev } from 'support/dev';
import {
  CtCycleRunner,
  CtScoreboard,
  CtScoreManager,
  CtTickRunner,
} from '../core';

type ShowOpts = { member: GuildMember };

const scoreboard: CommandFn = async ({ embed, guild }) => {
  const scoreboard = new CtScoreboard(guild);

  embed.infoColor().setTitle('COOLTRAINER Scoreboard');

  for await (const { member, score } of scoreboard) {
    embed.addField(member.displayName, score);
  }

  await embed.reply();
};

const tick: CommandFn = async ({ embed, guild }) => {
  CtTickRunner.run(guild);
  await embed.okColor().setTitle('Initiated a cooltrainer tick.').reply();
};

const cycle: CommandFn = async ({ embed, guild }) => {
  CtCycleRunner.run(guild);
  await embed.okColor().setTitle('Initiated a cooltrainer cycle.').reply();
};

const show: CommandFn<ShowOpts> = async ({ opts, embed }) => {
  const { member } = opts;
  const summary = await CtScoreManager.fetchSummary(member);

  await embed
    .infoColor()
    .setTitle(member.displayName)
    .addField('Score', summary.score)
    .addField('Has COOLTRAINER', summary.hasRole)
    .reply();
};

export default new LocalMultipartCommand(
  { show, tick, scoreboard, cycle },
  {
    name: 'cooltrainer',
    description: 'Commands relating to cooltrainer.',
    defaultPermission: isDev,
    options: [
      {
        name: 'scoreboard',
        type: 'SUB_COMMAND',
        description: 'Shows the top cooltrainer scores.',
      },
      {
        name: 'show',
        type: 'SUB_COMMAND',
        description: 'Shows the cooltrainer information for a user.',
        options: [
          {
            name: 'member',
            type: 'USER',
            description: 'User to show cooltrainer information for.',
            required: true,
          },
        ],
      },
      {
        name: 'tick',
        type: 'SUB_COMMAND',
        description:
          "[UNSAFE] Manually runs a cooltrainer tick, recalculating everyone's roles accordingly.",
      },
      {
        name: 'cycle',
        type: 'SUB_COMMAND',
        description:
          '[UNSAFE] Manually runs a cooltrainer weekly cycle, clearing out points from the previous week.',
      },
    ],
  },
);
