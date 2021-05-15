import { OWNER } from 'secrets.json';
import { Command, CommandFn } from 'interaction/command';
import { disambiguate } from 'interaction/command/disambiguate';
import { InteractionDanger } from 'interaction/errors';
import {
  missedPartialDeletions,
  missedPartialLeaves,
  uptime,
} from 'porygon/stats';
import { isDev } from 'support/dev';

type StatsOpts = { stats: never };
type Opts = StatsOpts;

const op: Command<Opts> = async (args) => {
  if (args.member.user.id !== OWNER) {
    throw new InteractionDanger('No.');
  }

  await disambiguate(args, { stats: opStats });
};

const opStats: CommandFn<StatsOpts> = async ({ embed, client }) => {
  await embed
    .infoColor()
    .setTitle('Stats for operators')
    .addField('Porygon servers', client.guilds.cache.size)
    .addField('Porygon uptime', uptime.inWords())
    .addField('% of missed partial leaves', missedPartialLeaves.percent)
    .addField('% of missed partial deletions', missedPartialDeletions.percent)
    .reply();
};

op.defaultPermission = isDev;
op.description = 'Operator-only utilities.';
op.options = [
  {
    name: 'stats',
    description: 'Shows useful stats.',
    type: 'SUB_COMMAND',
  },
];

export default op;
