import { Collection } from 'discord.js';
import { Embed } from 'porygon/embed';
import { setting } from 'porygon/settings';
import { random } from 'support/array';
import { codeBlock } from 'support/format';

enum Guess {
  Valid,
  Invalid,
}

export class HangmanWord {
  word: string;
  private guesses = new Collection<string, Guess>();

  constructor() {
    this.word = random(setting('pkg.games.hangman.words').value);
  }

  get isWon() {
    const correctGuesses = this.guesses.filter((x) => x === Guess.Valid).size;
    return new Set([...this.word]).size <= correctGuesses;
  }

  isGuessable(char: string) {
    char = char.toLowerCase();
    return char.length === 1 && !this.guesses.has(char);
  }

  guess(char: string) {
    char = char.toLowerCase();

    if (this.word.includes(char)) {
      this.guesses.set(char, Guess.Valid);
      return true;
    }

    this.guesses.set(char, Guess.Invalid);
    return false;
  }

  intoEmbed(embed: Embed) {
    embed.setDescription(this.toString());
  }

  private toString() {
    let buffer = '';

    for (const char of this.word) {
      buffer += this.guesses.get(char) === Guess.Valid ? char : '_';
    }

    return codeBlock(buffer);
  }
}
