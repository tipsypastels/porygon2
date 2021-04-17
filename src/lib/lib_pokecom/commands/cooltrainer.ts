import { GuildMember } from 'discord.js';
import { Command, CommandHandler } from 'interaction/command';
import { disambiguate } from 'interaction/command/disambiguate';
import { CtScoreManager } from '../models/cooltrainer/score';

type ScoreboardOpts = { scoreboard: never };
type ShowOpts = { show: { member: GuildMember } };
type Opts = ShowOpts | ScoreboardOpts;

const ct: Command<Opts> = async (args) => {
  await disambiguate(args, { show: ctShow });
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
];

export default ct;
