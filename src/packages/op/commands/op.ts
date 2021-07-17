import { globallyLocateChannel } from 'porygon/global_channel_ref';
import { CommandFn, LocalMultipartCommand } from 'porygon/interaction';
import { assertOwner } from 'porygon/owner';
import { missedPartialDeletions, missedPartialLeaves, uptime } from 'porygon/stats';
import { isDev } from 'support/dev';

interface SayOpts {
  code: string;
  message: string;
}

const say: CommandFn<SayOpts> = async ({
  interaction,
  opts,
  client,
  channel,
  guild,
  author,
}) => {
  assertOwner(author);

  const { code, message } = opts;
  const destChannel = globallyLocateChannel({
    code,
    client,
    currentChannel: channel,
    currentGuild: guild,
  });

  await Promise.all([
    destChannel.send(message),
    interaction.reply('✅', { ephemeral: true }),
  ]);
};

const stats: CommandFn = async ({ embed, client, author }) => {
  assertOwner(author);

  await embed
    .infoColor()
    .setTitle('Stats for operators')
    .addField('Porygon servers', client.guilds.cache.size)
    .addField('Porygon uptime', uptime.inWords())
    .addField('% of missed partial leaves', missedPartialLeaves.percent)
    .addField('% of missed partial deletions', missedPartialDeletions.percent)
    .reply();
};

export default new LocalMultipartCommand(
  { say, stats },
  {
    name: 'op',
    defaultPermission: isDev,
    description: 'Operator-only utilities.',
    options: [
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
      {
        name: 'stats',
        description: 'Shows useful stats.',
        type: 'SUB_COMMAND',
      },
    ],
  },
);
