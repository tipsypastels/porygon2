import { Ary } from './array';
import { NONE } from './null';

/* -------------------------------------------------------------------------- */
/*                                    Types                                   */
/* -------------------------------------------------------------------------- */

/**
 * The most general function type.
 */
export type AnyFn = (...args: Ary) => any;

/**
 * A type that may exist, or may need to be produced via a callback
 * with parameters `P`. The `into_resolved` function can be used to
 * normalize a `Resolvable` type.
 */
export type Resolvable<T, P extends Ary = []> = T | ((...params: P) => T);

/* -------------------------------------------------------------------------- */
/*                               Type Predicates                              */
/* -------------------------------------------------------------------------- */

/**
 * Returns whether a mysterious value is a function.
 */
export function is_function(value: unknown): value is AnyFn {
  return typeof value === 'function';
}

/* -------------------------------------------------------------------------- */
/*                                  Utilities                                 */
/* -------------------------------------------------------------------------- */

/**
 * Resolves an ambiguously lazy value using the provided parameters `p`.
 *
 * @see Resolvable
 */
export function into_resolved<T, P extends Ary = []>(t: Resolvable<T, P>, ...p: P): T {
  return is_function(t) ? t(...p) : t;
}

/**
 * The identity function. Returns the passed in value.
 */
export const identity = <T>(t: T) => t;

/**
 * The function that does nothing.
 */
export const noop = () => NONE;

/**
 * Executes a side effect function, returning the value unchanged.
 */
export function tap<T>(fn: (t: T) => void, value: T) {
  fn(value);
  return value;
}

/**
 * Partially applies the provided arguments `head` to `f`, returning a new
 * function that takes the remaining arguments `u`. This is partial application,
 * similar to currying.
 *
 *     const truncate = partial(ellipsis, 5);
 *     truncate("hello world") // => "hello...";
 */
export function partial<T extends Ary, U extends Ary, R>(
  f: (...args: [...T, ...U]) => R,
  ...head: T
) {
  return (...tail: U) => f(...head, ...tail);
}
