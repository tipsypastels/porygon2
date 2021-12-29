import { uptime } from 'core/client';
import { add_command, ChatCommand } from 'core/command';
import { GLOBAL } from 'core/controller';
import { TaskRegistrar } from 'core/initializer/task';
import { assert_owner } from 'core/owner';
import { IS_STAGING } from 'support/env';

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

add_command(GLOBAL, stats, {
  name: 'stats',
  description: 'Shows status information.',
  defaultPermission: IS_STAGING,
});
