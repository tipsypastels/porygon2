import { NONE } from '../type';

export { curry } from './curry';

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
