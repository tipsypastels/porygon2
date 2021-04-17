import { Command } from 'interaction/command';
import { setting } from 'porygon/settings';
import { OWNER } from 'secrets.json';

const helpDesc = setting<string>('pory.help_desc');

const help: Command = async ({ client, embed }) => {
  const owner = await client.users.cache.get(OWNER);
  const ownerAvatar = owner?.avatarURL() ?? undefined;

  await embed
    .infoColor()
    .poryThumb('smile')
    .setTitle("Hello! My name's Pory.")
    .setDescription(helpDesc.value)
    .setFooter('Created by Dakota', ownerAvatar)
    .reply();
};

help.description = 'Shows basic help information.';

export default help;
