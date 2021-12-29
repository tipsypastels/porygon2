import { panic } from './logger';

/**
 * Run-of-the-mill assertion function. Throws an error if it fails.
 */
export function assert(cond: any, message: string): asserts cond {
  if (!cond) throw new AssertionError(message);
}

/**
 * Same as `assert`, but much more deadly. Panics (crashes the program)
 * on failure.
 */
export function panic_assert(cond: any, message: string): asserts cond {
  if (!cond) panic(message);
}

export class AssertionError extends Error {}
