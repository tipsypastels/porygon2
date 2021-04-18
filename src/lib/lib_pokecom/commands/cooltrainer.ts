import { GuildMember } from 'discord.js';
import { Command, CommandHandler } from 'interaction/command';
import { disambiguate } from 'interaction/command/disambiguate';
import {
  CtCycleRunner,
  CtScoreboard,
  CtScoreManager,
  CtTickRunner,
} from '../models/cooltrainer';

type ScoreboardOpts = { scoreboard: never };
type TickOpts = { tick: never };
type CycleOpts = { cycle: never };
type ShowOpts = { show: { member: GuildMember } };
type Opts = ShowOpts | TickOpts | ScoreboardOpts;

const ct: Command<Opts> = async (args) => {
  await disambiguate(args, {
    show: ctShow,
    tick: ctTick,
    cycle: ctCycle,
    scoreboard: ctScoreboard,
  });
};

const ctScoreboard: CommandHandler<ScoreboardOpts> = async ({
  embed,
  guild,
}) => {
  const scoreboard = new CtScoreboard(guild);

  embed.infoColor().setTitle('COOLTRAINER Scoreboard');

  for await (const { member, score } of scoreboard) {
    embed.addField(member.displayName, score);
  }

  await embed.reply();
};

const ctTick: CommandHandler<TickOpts> = async ({ embed, guild }) => {
  CtTickRunner.run(guild);
  await embed.okColor().setTitle('Initiated a cooltrainer tick.').reply();
};

const ctCycle: CommandHandler<CycleOpts> = async ({ embed, guild }) => {
  CtCycleRunner.run(guild);
  await embed.okColor().setTitle('Initiated a cooltrainer cycle.').reply();
};

const ctShow: CommandHandler<ShowOpts> = async ({ opts, embed }) => {
  const { member } = opts.show;
  const summary = await CtScoreManager.fetchSummary(member);

  await embed
    .infoColor()
    .setTitle(member.displayName)
    .addField('Score', summary.score)
    .addField('Has COOLTRAINER', summary.hasRole)
    .reply();
};

ct.commandName = 'cooltrainer';
ct.description = 'Commands relating to cooltrainer.';
ct.options = [
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
];

export default ct;
