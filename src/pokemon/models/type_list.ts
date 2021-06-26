import { DEFAULT_EFFECTIVENESS } from './effectiveness';
import type { Type } from './type';

/**
 * A plain class that wraps a type list with additional functionality.
 * This is usually used through delegation on `Type`.
 */
export class TypeList {
  constructor(private readonly types: Type[]) {}

  /**
   * The number of types in this list. This is only ever `1` or `2` conventionally,
   * but more are supported.
   */
  get count() {
    return this.types.length;
  }

  /**
   * Calculates this the total weakness to an incoming attack of type `type`.
   * An inverse function `strengthAgainst` is not provided as only the move
   * effectiveness would matter in that case (+ STAB).
   *
   * NOTE: This function returns the number-backed `Effectiveness` enum, but
   * if there are more than 2 types in this list, it's possible for the result
   * of multiplication to exceed the enum. Explicitly cast to a number
   * in that case, and handle checks manually.
   */
  weaknessTo(type: Type) {
    const results = this.map((t) => type.getEffectiveness('offense', t));
    return results.reduce((a, b) => a * b, DEFAULT_EFFECTIVENESS);
  }

  private map<R>(fn: (type: Type) => R) {
    return this.types.map(fn);
  }
}
