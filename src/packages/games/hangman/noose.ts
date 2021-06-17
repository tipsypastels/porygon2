import { HANGMAN_ASSETS } from 'porygon/assets';
import { Embed } from 'porygon/embed';

const MAX = 10;

export class HangmanNoose {
  private stage = 0;

  get isLost() {
    return this.stage >= MAX;
  }

  increment() {
    this.stage++;
  }

  intoEmbed(embed: Embed) {
    embed.setThumbnail(HANGMAN_ASSETS.get(this.stage).url);
  }
}
