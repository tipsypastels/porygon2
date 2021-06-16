import { Command } from 'porygon/interaction';
import { setting } from 'porygon/settings';
import { OWNER } from 'secrets.json';

const helpDesc = setting('pory.help_desc');

const help: Command.Fn = async ({ client, embed }) => {
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

export default new Command(help, {
  description: 'Shows basic help information.',
});
