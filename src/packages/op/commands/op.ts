import { OWNER } from 'secrets.json';
import { Command } from 'porygon/interaction/command';
import { InteractionDanger } from 'interaction/errors';
import {
  missedPartialDeletions,
  missedPartialLeaves,
  uptime,
} from 'porygon/stats';
import { isDev } from 'support/dev';

const stats: Command.Fn = async ({ embed, client, member }) => {
  if (member.user.id !== OWNER) {
    throw new InteractionDanger('No.');
  }

  await embed
    .infoColor()
    .setTitle('Stats for operators')
    .addField('Porygon servers', client.guilds.cache.size)
    .addField('Porygon uptime', uptime.inWords())
    .addField('% of missed partial leaves', missedPartialLeaves.percent)
    .addField('% of missed partial deletions', missedPartialDeletions.percent)
    .reply();
};

export default new Command.Multipart(
  { stats },
  {
    name: 'op',
    defaultPermission: isDev,
    description: 'Operator-only utilities.',
    options: [
      {
        name: 'stats',
        description: 'Shows useful stats.',
        type: 'SUB_COMMAND',
      },
    ],
  },
);
