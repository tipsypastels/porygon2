import { HANGMAN_ASSETS } from 'porygon/assets';
import { PorygonEmbed } from 'porygon/embed';

const MAX = 10;

export class HangmanNoose {
  private stage = 0;

  get isLost() {
    return this.stage >= MAX;
  }

  increment() {
    this.stage++;
  }

  intoEmbed(embed: PorygonEmbed) {
    embed.setThumbnail(HANGMAN_ASSETS[this.stage].url);
  }
}
