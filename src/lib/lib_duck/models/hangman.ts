import {
  CommandInteraction,
  Message,
  MessageCollector,
  TextChannel,
} from 'discord.js';
import { PorygonEmbed } from 'porygon/embed';
import { HangmanNoose } from './hangman/noose';
import { HangmanState } from './hangman/state';
import { HangmanWord } from './hangman/word';

interface GameOpts {
  channel: TextChannel;
  interaction: CommandInteraction;
}

export class Hangman {
  readonly channel: TextChannel;
  readonly interaction: CommandInteraction;
  readonly collector: MessageCollector;

  readonly noose = new HangmanNoose();
  readonly word = new HangmanWord();
  private state = new HangmanState.Ongoing(this);

  constructor(opts: GameOpts) {
    this.channel = opts.channel;
    this.interaction = opts.interaction;
    this.collector = this.channel.createMessageCollector((m) => {
      return this.word.isGuessable(m.content);
    });

    this.collector.on('collect', (m) => this.call(m));
  }

  async start() {
    await this.render();
  }

  private async call(message: Message) {
    this.word.guess(message.content) || this.noose.increment();
    this.nextState();

    if (!this.state.isOngoing) {
      this.collector.stop();
    }

    await this.render();
  }

  private async render() {
    await PorygonEmbed.fromInteraction(this.interaction)
      .merge(this.word)
      .merge(this.noose)
      .merge(this.state)
      .reply();
  }

  private nextState() {
    if (this.word.isWon) {
      this.state = new HangmanState.Won(this);
    }

    if (this.noose.isLost) {
      this.state = new HangmanState.Lost(this);
    }
  }
}
