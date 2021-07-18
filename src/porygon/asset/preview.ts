import { TextChannel } from 'discord.js';
import { Embed } from 'porygon/embed';
import { Asset } from './asset';
import { AssetGroup } from './group';

/**
 * Used by /op previewasset. Prints out the asset (or each asset in the group)
 * into an embed.
 */
export async function previewAssets(
  asset: Asset | AssetGroup<any>,
  channel: TextChannel,
) {
  if (asset instanceof AssetGroup) {
    for (const asset_ of asset) {
      await preview(asset_, channel);
    }
  } else {
    preview(asset, channel);
  }
}

function preview(asset: Asset, channel: TextChannel) {
  const embed = new Embed()
    .setTitle(asset.path)
    .setDescription(LIPSUM)
    .setThumbnail(asset.url);

  return channel.send(embed);
}

const LIPSUM =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed et sapien quis erat lacinia luctus sit amet nec lorem. Nulla vel diam eget enim scelerisque sodales. Sed vulputate mollis lobortis. Nulla ut ipsum quam. Maecenas dui orci, fringilla eu fermentum eu, tempor in sem. Etiam consequat lectus libero, ut luctus tortor sagittis at. Pellentesque est lacus, consequat et ipsum vitae, eleifend interdum ante. Donec vel arcu ac urna elementum pretium non vel felis. Nam auctor fermentum rhoncus.';
