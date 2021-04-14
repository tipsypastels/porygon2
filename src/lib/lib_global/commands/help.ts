import { Command } from 'interaction/command';
import { OWNER } from 'secrets.json';

const help: Command = async ({ client, embed }) => {
  const owner = await client.users.cache.get(OWNER);
  const ownerAvatar = owner?.avatarURL() ?? undefined;

  await embed
    .infoColor()
    .setTitle("Hello! My name's Pory.")
    .setDescription('You can see a pop-up list of commands by pressing `/`.')
    .setFooter('Created by Dakota', ownerAvatar)
    .reply();
};

help.description = 'Shows basic help information.';

export default help;
