/**
 * Represents an asset in the `/assets` directory, but with a twist.
 *
 * For static assets, it's a waste to upload them to Discord over and over. However,
 * maintaining an imgur repository is also annoying. Instead, we rely on github to
 * serve the images, as the repository is public.
 *
 * The only downside is that you do have to push before new assets will appear, but this
 * is fairly trivial.
 */

const BASE_GITHUB_URL =
  'https://github.com/tipsypastels/porygon/blob/main/assets';

export class PorygonAsset {
  constructor(readonly path: string) {}

  get githubUrl() {
    return `${BASE_GITHUB_URL}/${this.path}`;
  }
}
