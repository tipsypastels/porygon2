import { add_command, ChatCommand } from 'core/command';
import { GLOBAL } from 'core/controller';
import { fetch_owner } from 'core/owner';

const help: ChatCommand = async ({ embed, reply, client }) => {
  reply.set_ephemeral();

  const owner = await fetch_owner(client);
  const owner_avatar = owner?.avatarURL() ?? undefined;

  embed
    .color('info')
    .pory('smile')
    .title("Hello! My name's Pory.")
    .about(ABOUT)
    .foot('Created by Dakota', owner_avatar);
};

add_command(GLOBAL, help, {
  name: 'help',
  description: 'Shows basic help information.',
});

const ABOUT =
  'You can see a pop-up list of commands by pressing `/`. If you have any other questions or suggestions, please direct them to my creator!';
