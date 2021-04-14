const BASE_GITHUB_URL =
  'https://raw.githubusercontent.com/tipsypastels/porygon2/main/assets';

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
function toGithubUrl(path: string) {
  return `${BASE_GITHUB_URL}/${path}`;
}

export const PORY_THUMBS = {
  'danger': toGithubUrl('pory/danger.png'),
  'speech': toGithubUrl('pory/speech.png'),
  '8ball': toGithubUrl('pory/8ball.png'),
  'plead': toGithubUrl('pory/plead.png'),
  'death': toGithubUrl('pory/death.png'),
  'math': toGithubUrl('pory/math.gif'),
  'angry': toGithubUrl('pory/angry.png'),
  'thanos': toGithubUrl('pory/thanos.png'),
  'smile': toGithubUrl('pory/smile.png'),
  'warning': toGithubUrl('pory/warning.png'),
  'error': toGithubUrl('pory/error.png'),
};
