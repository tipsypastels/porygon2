import { IMGUR_CLIENT } from 'secrets.json';
import { ImgurClient } from 'imgur';
import type { Asset } from './index';

const imgur = new ImgurClient({ clientId: IMGUR_CLIENT });

export async function upload(asset: Asset) {
  const res = await imgur.upload(asset.path);

  if (Array.isArray(res)) {
    return res[0].data.link;
  }

  return res.data.link;
}
