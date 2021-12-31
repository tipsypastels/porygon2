import { is_none, Maybe } from 'support/null';
import { panic } from './logger';

/**
 * Run-of-the-mill assertion function. Throws an error if it fails.
 */
export function assert(cond: any, message: string): asserts cond {
  if (!cond) throw new AssertionError(message);
}

/**
 * Takes a value `Maybe<T>`, asserts it to be non-none, and returns
 * it unchanged.
 */
export function take<T>(value: Maybe<T>, message: string): T {
  assert(!is_none(value), message);
  return value;
}

/**
 * Same as `assert`, but much more deadly. Panics (crashes the program)
 * on failure.
 */
export function panic_assert(cond: any, message: string): asserts cond {
  if (!cond) panic(message);
}

/**
 * Panicking version of `take`: takes a value `Maybe<T>`, asserts
 * it to be non-none and returns it, or panics (crashes the program).
 */
export function panic_take<T>(value: Maybe<T>, message: string): T {
  panic_assert(!is_none(value), message);
  return value;
}

export class AssertionError extends Error {}
