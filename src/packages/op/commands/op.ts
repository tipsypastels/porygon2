import { OWNER } from 'secrets.json';
import { Command } from 'porygon/interaction';
import { InteractionDanger } from 'interaction/errors';
import {
  missedPartialDeletions,
  missedPartialLeaves,
  uptime,
} from 'porygon/stats';
import { isDev } from 'support/dev';
import { globallyLocateChannel } from 'porygon/global_channel_ref';

interface SayOpts {
  code: string;
  message: string;
}

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

const say: Command.Fn<SayOpts> = async ({
  interaction,
  opts,
  client,
  guild,
}) => {
  const { code, message } = opts;
  const channel = globallyLocateChannel({ code, client, currentGuild: guild });

  await Promise.all([channel.send(message), interaction.reply('✅')]);
};

export default new Command.Multipart(
  { stats, say },
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
      {
        name: 'say',
        description: 'Send a message to any channel.',
        type: 'SUB_COMMAND',
        options: [
          {
            name: 'code',
            description: 'The channel identifier code.',
            type: 'STRING',
            required: true,
          },
          {
            name: 'message',
            description: 'The message to send.',
            type: 'STRING',
            required: true,
          },
        ],
      },
    ],
  },
);
