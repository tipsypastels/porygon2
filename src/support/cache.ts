import { Ary, UNSET, Unset } from './type';

/**
 * Wraps a function that is only called once. On subsequent calls, the
 * memoized result is returned immediately.
 *
 * This utility does *NOT* take account of its parameters, and cannot
 * memoize multiple values based on the parameters passed in. Do not use
 * it for a function that will be called with different values each time,
 * it will not take account of its parameters at all on subsequent calls.
 */
export class Lazy<T, P extends Ary = []> {
  private value: Unset<T> = UNSET;
  constructor(private factory: (...params: P) => T) {}

  get(...params: P): T {
    if (this.value === UNSET) this.value = this.factory(...params);
    return this.value;
  }
}

/**
 * Wraps a collection with a function that lazily generates new values as requested.
 */
export class Cache<K, V extends {}, P extends Ary = []> {
  private map = new Map<K, V>();
  constructor(private factory: (key: K, ...extra_params: P) => V) {}

  get(key: K, ...extra_params: P): V {
    const current_value = this.map.get(key);

    if (current_value != null) {
      return current_value;
    }

    const new_value = this.factory(key, ...extra_params);
    this.map.set(key, new_value);
    return new_value;
  }
}
