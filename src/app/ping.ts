import { uptime } from 'core/client';
import { add_command, ChatCommand } from 'core/command';
import { GLOBAL } from 'core/controller';

const ping: ChatCommand = async ({ embed, reply, client }) => {
  reply.set_ephemeral();

  embed
    .pory('speech')
    .color('info')
    .title(':sparkles: Pong! Porygon is online~')
    .about('_beep boop_ How are you today?')
    .field('Uptime', uptime.in_words())
    .field('Heartbeat', `${client.ws.ping}ms`);
};

add_command(GLOBAL, ping, {
  name: 'ping',
  description: 'Pings the bot!',
});
