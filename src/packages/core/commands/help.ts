import { CommandFn, LocalCommand } from 'porygon/interaction';
import { findOwner } from 'porygon/owner';
import { setting } from 'porygon/settings';

const helpDesc = setting('pory.help_desc');

const help: CommandFn = async ({ client, embed }) => {
  const owner = findOwner(client);
  const ownerAvatar = owner?.avatarURL() ?? undefined;

  await embed
    .infoColor()
    .poryThumb('smile')
    .setTitle("Hello! My name's Pory.")
    .setDescription(helpDesc.value)
    .setFooter('Created by Dakota', ownerAvatar)
    .reply();
};

export default new LocalCommand(help, {
  description: 'Shows basic help information.',
});
