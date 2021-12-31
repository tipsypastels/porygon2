import { Map, Set } from 'immutable';
import { Maybe } from 'support/null';
import { lower } from 'support/string';

/**
 * The low-level state machine that describes a hangman game.
 *
 * This state is immutable and disconnected from Discord.js semantics,
 * both for the sake of being easily testable. Depending on its type, it
 * contains methods relevant to that state - usually Ongoing.
 */
export type State = Ongoing | Ended;
export type { Ongoing, Ended, Won, Lost, Cancelled };
export type EndingTag = 'won' | 'lost' | 'cancelled';

export function create_hangman_state(word: string, chances: number) {
  return new Ongoing(word, chances);
}

type Guesses = Map<string, boolean>;
type Chars = Set<string>;

/**
 * The state of an ongoing hangman game.
 *
 * This state has the bulk of the methods that can be applied to the game,
 * since they can only be applied in this context. It is immutable, and returns
 * a new copy for each modification.
 */
class Ongoing {
  readonly tag = 'ongoing';
  private readonly chars: Chars;

  constructor(
    readonly word: string,
    readonly chances: number,
    private readonly guesses: Guesses = Map(),
    // used for testing only, we don't return it because the actual higher
    // level implementation doesn't even look at it
    readonly previous_guess_validity?: Maybe<boolean>,
  ) {
    this.chars = Set([...this.word]);
  }

  get printed_word() {
    return [...this.word].map((char) => this.printed_char(char)).join('');
  }

  private printed_char(char: string) {
    return this.guesses.has(char) ? char : '_';
  }

  get incorrect_guesses_count() {
    return this.of_type(false);
  }

  guess(word: string): State {
    word = lower(word);

    if (word === this.word) {
      return this.ended(Won);
    }

    if (word.length === 1) {
      return this.guess_char(word).check_ended();
    }

    return this.clone(this.guesses, false);
  }

  private guess_char(char: string) {
    const valid = this.word.includes(char);
    const guesses = this.guesses.set(char, valid);
    return this.clone(guesses, valid);
  }

  private check_ended(): State {
    if (this.chars.size <= this.of_type(true)) {
      return this.ended(Won);
    }

    if (this.chances <= this.of_type(false)) {
      return this.ended(Lost);
    }

    return this;
  }

  is_valid_guess(word: string) {
    return lower(word) === this.word || word.length === 1;
  }

  cancelled() {
    return this.ended(Cancelled);
  }

  private ended(ctor: EndingCtor) {
    return new ctor(this.word, this.printed_word, this.incorrect_guesses_count);
  }

  private clone(guesses: Guesses, was_valid?: boolean) {
    return new Ongoing(this.word, this.chances, guesses, was_valid);
  }

  private of_type(type: boolean) {
    return this.guesses.filter((g) => g === type).size;
  }
}

type EndingCtor = typeof Won | typeof Lost | typeof Cancelled;

/**
 * The state of an ended hangman game. There are several different ending types,
 * but higher level code need not worry about that, since they all have the same
 * operations and properties.
 */
abstract class Ended {
  abstract readonly tag: EndingTag;

  constructor(
    readonly word: string,
    readonly printed_word: string,
    readonly incorrect_guesses_count: number,
  ) {}
}

/**
 * A won game.
 *
 * The only difference here is that we always print out the full word instead of its
 * guess status. This technically could be avoided by having `Ongoing` clone itself and
 * fill all characters in its map, *then* pass that to the `Won`, but especially for
 * when the full word is guessed that's a waste of time.
 */
class Won extends Ended {
  readonly tag = 'won';

  constructor(word: string, _: string, incorrect_guesses_count: number) {
    super(word, word, incorrect_guesses_count);
  }
}

/**
 * A lost game.
 */
class Lost extends Ended {
  readonly tag = 'lost';
}

/**
 * A cancelled game, such as by running out of time.
 */
class Cancelled extends Ended {
  readonly tag = 'cancelled';
}
