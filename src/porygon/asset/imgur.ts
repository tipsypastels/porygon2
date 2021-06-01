import { IMGUR_CLIENT } from 'secrets.json';
import { ImgurClient } from 'imgur';
import type { Asset } from './index';
import { logger } from 'porygon/logger';

const imgur = new ImgurClient({ clientId: IMGUR_CLIENT });

export function upload(asset: Asset) {
  return imgur
    .upload(asset.path)
    .then((res) => {
      if (Array.isArray(res)) {
        return res[0].data.link;
      }
      return res.data.link;
    })
    .catch((e) => {
      logger.error('Imgur upload failed.');
      throw e;
    });
}
