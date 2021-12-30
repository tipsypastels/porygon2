import { uptime } from 'core/client';
import { add_sub_commands, ChatCommand } from 'core/command';
import { GLOBAL } from 'core/controller';
import { TaskRegistrar } from 'core/initializer/task';
import { assert_owner } from 'core/owner';
import { IS_STAGING } from 'support/env';

const say: ChatCommand = async ({ opts, channel, author, reply }) => {
  assert_owner(author);
  reply.set_ephemeral().set_content('\\✅');

  const message = opts.str('message');
  const destination = opts.maybe_channel('channel') ?? channel;

  await reply.send();
  await destination.send(message);
};

const stats: ChatCommand = async ({ embed, author, client, reply }) => {
  assert_owner(author);
  reply.set_ephemeral();

  embed
    .pory('speech')
    .color('info')
    .title('Stats for Operators')
    .field('Servers', `${client.guilds.cache.size}`)
    .field('Uptime', uptime.in_words())
    .field('Heartbeat', `${client.ws.ping}ms`)
    .field('Tasks', TaskRegistrar.to_status_string());
};

const commands = { say, stats };

add_sub_commands(GLOBAL, commands, {
  name: 'op',
  description: 'Operator-only utilities.',
  defaultPermission: IS_STAGING,
  options: [
    {
      name: 'say',
      description: 'Sends a message to any channel.',
      type: 'SUB_COMMAND',
      options: [
        {
          name: 'message',
          description: 'The message to send.',
          type: 'STRING',
          required: true,
        },
        {
          name: 'channel',
          description: 'The channel to send to. Defaults to current if unset.',
          type: 'CHANNEL',
          required: false,
        },
      ],
    },
    {
      name: 'stats',
      description: 'Shows useful stats.',
      type: 'SUB_COMMAND',
    },
  ],
});
