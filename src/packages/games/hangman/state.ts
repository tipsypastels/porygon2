import { Embed } from 'porygon/embed';
import { Hangman } from '.';

export abstract class HangmanState {
  constructor(protected game: Hangman) {}

  abstract isOngoing: boolean;
  abstract intoEmbed(embed: Embed): void;

  protected get word() {
    return this.game.word.word;
  }
}

export namespace HangmanState {
  export class Ongoing extends HangmanState {
    isOngoing = true;

    intoEmbed(embed: Embed) {
      embed
        .setTitle('Hangman')
        .infoColor()
        .addField('Letters', this.word.length);
    }
  }

  export class Won extends HangmanState {
    isOngoing = false;

    intoEmbed(embed: Embed) {
      embed.setTitle('Hangman - you won!').okColor();
    }
  }

  export class Lost extends HangmanState {
    isOngoing = false;

    intoEmbed(embed: Embed) {
      embed
        .setTitle('Hangman - you lost!')
        .warningColor()
        .addField('The word was', this.word)
        .setFooter('Press F to pay respects to Porygon');
    }
  }
}
