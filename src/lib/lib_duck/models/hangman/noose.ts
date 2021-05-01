import { hangmanThumb } from 'porygon/asset';
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
    embed.setThumbnail(hangmanThumb(this.stage));
  }
}
