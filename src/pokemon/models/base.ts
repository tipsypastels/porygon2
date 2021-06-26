import type { Hydrator } from '../hydrator';
import type { Kind, MatchKind } from '../kind';

export interface RawBase {
  name: string;
}

/**
 * The base type of all Pokemon data classes.
 * @template R - The raw form of
 */
export abstract class Base<R extends RawBase> {
  static get kind() {
    return this.prototype.kind;
  }

  static hydrate(_hydrator: Hydrator) {
    // no-op
  }

  constructor(readonly id: string, raw: R) {
    Object.assign(this, raw);
  }

  /**
   * The kind of this data class as a string.
   * Used for metaprogramming.
   */
  abstract kind: Kind;

  /**
   * All data class items must have a name.
   * This enables searching.
   */
  abstract name: string;

  /**
   * Takes an object with functions for each kind of data class and
   * calls the correct one for the current kind. Useful for disambiguating
   * data classes where you're not sure what kind you're working with.
   */
  match<R>(kinds: MatchKind<R>) {
    return kinds[this.kind]?.(this as any);
  }

  /**
   * Same as `match`, but will throw if the kind is one not provided in `kinds`.
   */
  exhaustiveMatch<R>(kinds: MatchKind<R>) {
    if (!(this.kind in kinds)) {
      exhaustiveMatchError(this.kind, Object.keys(kinds));
    }

    return kinds[this.kind]!(this as any);
  }
}

function exhaustiveMatchError(was: string, expected: string[]): never {
  const list = expected.join(', ');
  throw new Error(
    `Kind ${was} was not exhaustively matched as one of ${list}.`,
  );
}
