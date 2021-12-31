import { create_hangman_state, State, Ongoing, Ended, EndingTag } from './state';

const DEFAULT_WORD = 'alpaca';
const DEFAULT_WORD_UNGUESSED = '_'.repeat(DEFAULT_WORD.length);
const DEFAULT_CHANCES = 3;

function create(word = DEFAULT_WORD, chances = DEFAULT_CHANCES) {
  return create_hangman_state(word, chances);
}

function expect_ongoing(state: State): asserts state is Ongoing {
  expect(state.tag).toBe('ongoing');
}

function expect_ended(state: State, tag: EndingTag): asserts state is Ended {
  expect(state.tag).toBe(tag);
}

function expect_printed(state: State, printed: string) {
  expect(state.printed_word).toBe(printed);
}

function expect_validity(state: Ongoing, validity: boolean) {
  expect(state.previous_guess_validity).toBe(validity);
}

function guess_ongoing(state: Ongoing, guess: string): Ongoing {
  const next = state.guess(guess);
  expect_ongoing(next);
  return next;
}

function guess_ended(state: Ongoing, guess: string, tag: EndingTag): Ended {
  const next = state.guess(guess);
  expect_ended(next, tag);
  return next;
}

describe('hangman', () => {
  it('creates a game with the appropriate parameters', () => {
    const game = create();

    expect(game.word).toBe(DEFAULT_WORD);
    expect(game.printed_word).toBe(DEFAULT_WORD_UNGUESSED);
  });

  describe('guessing', () => {
    it('allows guessing letters', () => {
      let game: State;

      game = create();
      game = game.guess('p');

      expect_ongoing(game);
      expect_validity(game, true);
      expect_printed(game, '__p___');
    });

    it('allows guessing letters that appear multiple times', () => {
      let game: State;

      game = create();
      game = game.guess('a');

      expect_ongoing(game);
      expect_validity(game, true);
      expect_printed(game, 'a__a_a');
    });

    it('allows guessing letters that do not appear', () => {
      let game: State;

      game = create();
      game = game.guess('z');

      expect_ongoing(game);
      expect_validity(game, false);
      expect_printed(game, DEFAULT_WORD_UNGUESSED);
    });

    it('allows guessing the full word', () => {
      let game: State;

      game = create();
      game = game.guess(DEFAULT_WORD);

      expect_ended(game, 'won');
      expect_printed(game, DEFAULT_WORD);
    });

    it('ignores meaningless guesses', () => {
      let game: State;

      game = create();
      game = game.guess('xychromium');

      expect_ongoing(game);
      expect_validity(game, false);
      expect_printed(game, DEFAULT_WORD_UNGUESSED);
    });
  });

  describe('state', () => {
    it('starts in the ongoing state', () => {
      const game = create();
      expect_ongoing(game);
    });

    it('continues in that state as guesses occur', () => {
      const game = create();
      guess_ongoing(game, 'a');
    });

    it('ends after the number of incorrect guesses is reached', () => {
      let game: State;

      game = create();
      game = guess_ongoing(game, 'x');
      game = guess_ongoing(game, 'y');
      guess_ended(game, 'z', 'lost');
    });

    it('ignores repeated wrong guesses', () => {
      let game: State;

      game = create();
      game = guess_ongoing(game, 'x');
      game = guess_ongoing(game, 'y');
      game = guess_ongoing(game, 'y');
      guess_ended(game, 'z', 'lost');
    });

    it('ends after the right word is guessed', () => {
      let game: State;

      game = create();
      game = guess_ongoing(game, 'a');
      game = guess_ongoing(game, 'l');
      game = guess_ongoing(game, 'p');
      guess_ended(game, 'c', 'won');
    });

    it('ignores repeated right guesses', () => {
      let game: State;

      game = create();
      game = guess_ongoing(game, 'a');
      game = guess_ongoing(game, 'l');
      game = guess_ongoing(game, 'p');
      game = guess_ongoing(game, 'p');
      guess_ended(game, 'c', 'won');
    });

    it('ends immediately if cancelled is called', () => {
      let game: State;

      game = create();
      game = game.cancelled();

      expect_ended(game, 'cancelled');
    });
  });
});
