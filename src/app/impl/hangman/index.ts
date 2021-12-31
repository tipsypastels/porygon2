import { assert } from 'core/assert';
import { HANGMAN_ASSETS } from 'core/assets';
import { CommandChannel } from 'core/command/channel';
import { Reply } from 'core/command/reply';
import { Embed } from 'core/embed';
import { Message, MessageCollector } from 'discord.js';
import { code_block } from 'support/string';
import { State, Ongoing, Ended, create_hangman_state } from './state';
import { CHANCES, TIMEOUT, random_word } from './config';
import { create_usage_errors } from 'core/command';

interface Opts {
  reply: Reply;
  channel: CommandChannel;
}

/**
 * Contains the ongoing state, as well as mutable handles that only exist
 * while the game is ongoing. They must be closed before transitioning to
 * the ended state.
 */
interface OngoingCell {
  state: Ongoing;
  collector: MessageCollector;
  cancellation: NodeJS.Timeout;
}

/**
 * Contains solely the ending state, for parity with `OngoingCell`.
 */
interface EndedCell {
  state: Ended;
}

type StateCell = OngoingCell | EndedCell;
type Renderer<S extends State = State> = (embed: Embed, state: S) => void;

const BUSY_CHANNELS = new Set<string>();

/**
 * A hangman game.
 *
 * The actual logic lives in the `State` types, which are immutable and
 * disconnected from Discord-specific semantics so they can be tested easily.
 */
export class Hangman {
  private reply: Reply;
  private channel: CommandChannel;
  private cell: StateCell;

  constructor(opts: Opts) {
    assert_available(opts.channel);

    this.reply = opts.reply;
    this.channel = opts.channel;
    this.cell = this.create_initial_cell();
  }

  private create_initial_cell(): OngoingCell {
    const filter = (message: Message) => state.is_valid_guess(message.content);
    const guess = (message: Message) => this.guess(message.content);

    const state = create_hangman_state(random_word(), CHANCES);
    const collector = this.channel.createMessageCollector({ filter });
    const cancellation = setTimeout(() => this.cancel(), TIMEOUT);

    collector.on('collect', guess);
    return { state, collector, cancellation };
  }

  start() {
    return this.render();
  }

  guess(guess: string) {
    assert_ongoing(this.cell, 'guess');

    const state = this.cell.state.guess(guess);

    if (state.tag === 'ongoing') {
      this.cell.state = state;
    } else {
      this.cleanup(this.cell);
      this.cell = { state };
    }

    return this.render();
  }

  private cancel() {
    this.cleanup(this.cell);

    const state = this.cell.state.cancelled();
    this.cell = { state };

    return this.render();
  }

  private cleanup(cell: StateCell): asserts cell is OngoingCell {
    assert_ongoing(this.cell, 'cleanup');

    this.cell.collector.stop();
    clearTimeout(this.cell.cancellation);
    BUSY_CHANNELS.delete(this.channel.id);
  }

  private render() {
    const { state } = this.cell;

    this.reply.embed
      .reset()
      .merge(render_noose, state)
      .merge(render_printed, state)
      .merge(render_state, state);

    return this.reply.send_or_update();
  }
}

function assert_ongoing(cell: StateCell, verb: string): asserts cell is OngoingCell {
  assert(cell.state?.tag === 'ongoing', `Can't ${verb} after the game end!`);
}

const render_noose: Renderer = (embed, state) => {
  embed.thumb(HANGMAN_ASSETS.get(`${state.incorrect_guesses_count}`).url);
};

const render_printed: Renderer = (embed, state) => {
  embed.about(code_block(state.printed_word));
};

const render_state: Renderer = (embed, state) => {
  switch (state.tag) {
    case 'ongoing': {
      return embed
        .color('info')
        .title('Hangman')
        .field('Letters', `${state.word.length}`);
    }
    case 'won': {
      return embed.color('ok').title('Hangman - you won!');
    }
    case 'lost': {
      return embed
        .color('warning')
        .title('Hangman - you lost!')
        .field('The word was', state.word)
        .foot('Press F to pay respects to Porygon.');
    }
    case 'cancelled': {
      return embed
        .color('danger')
        .title('Hangman - timed out!')
        .about('Games time out after 10 minutes.')
        .field('The word was', state.word);
    }
  }
};

function assert_available(channel: CommandChannel) {
  if (BUSY_CHANNELS.has(channel.id)) {
    throw usage_error('busy');
  }

  BUSY_CHANNELS.add(channel.id);
}

const usage_error = create_usage_errors({
  busy(e) {
    e.err('danger')
      .title('A hangman game is already in progress in this channel.')
      .about('Please finish it or wait for it to conclude.');
  },
});
