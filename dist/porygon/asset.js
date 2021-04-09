"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PORY_PORTRAIT = void 0;
const BASE_GITHUB_URL = 'https://raw.githubusercontent.com/tipsypastels/porygon2/main/assets';
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
function toGithubUrl(path) {
    return `${BASE_GITHUB_URL}/${path}`;
}
exports.PORY_PORTRAIT = toGithubUrl('portrait.png');
