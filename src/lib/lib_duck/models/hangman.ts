import {
  CommandInteraction,
  Message,
  MessageCollector,
  TextChannel,
} from 'discord.js';
import { hangmanThumb } from 'porygon/asset';
import { PorygonEmbed } from 'porygon/embed';
import { codeBlock } from 'support/format';

interface GameOpts {
  channel: TextChannel;
  interaction: CommandInteraction;
}

enum GameState {
  Ongoing,
  Won,
  Lost,
}

export class Hangman {
  readonly channel: TextChannel;
  readonly interaction: CommandInteraction;
  readonly collector: MessageCollector;

  private noose = new Noose();
  private word = new Word();
  private state = GameState.Ongoing;

  constructor(opts: GameOpts) {
    this.channel = opts.channel;
    this.interaction = opts.interaction;
    this.collector = this.channel.createMessageCollector((m) => {
      return this.word.isGuessable(m.content);
    });

    this.collector.on('collect', (m) => this.call(m));
  }

  async start() {
    await this.word.pick();
    await this.render();
  }

  private async call(message: Message) {
    this.word.guess(message.content) || this.noose.increment();

    await this.render();
  }

  private async render() {
    await PorygonEmbed.fromInteraction(this.interaction)
      .setTitle('Hangman!')
      .infoColor()
      .merge(this.word)
      .merge(this.noose)
      .reply();
  }
}

class Word {
  private word!: string;
  private correctGuesses = new Set<string>();

  async pick() {
    this.word = 'hello';
  }

  get isWon() {
    return this.word.length <= this.correctGuesses.size;
  }

  isGuessable(char: string) {
    return char.length === 1 && !this.correctGuesses.has(char);
  }

  guess(char: string) {
    if (this.word.includes(char)) {
      this.correctGuesses.add(char);
      return true;
    }

    return false;
  }

  intoEmbed(embed: PorygonEmbed) {
    embed.setDescription(this.toString());
  }

  private toString() {
    let buffer = '';

    for (const char of this.word) {
      buffer += this.correctGuesses.has(char) ? char : '_';
    }

    return codeBlock(buffer);
  }
}

class Noose {
  private stage = 0;

  increment() {
    this.stage++;
  }

  intoEmbed(embed: PorygonEmbed) {
    embed.setThumbnail(hangmanThumb(this.stage));
  }
}
