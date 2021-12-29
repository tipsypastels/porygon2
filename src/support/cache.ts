import { Ary } from './array';
import { Unset, UNSET } from './unset';

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

type Factory<K, V, P extends Ary> = (key: K, ...p: P) => V;
type Updater<K, V, P extends Ary> = (v: V, k: K, ...p: P) => V;

/**
 * Wraps a collection with a function that lazily generates new values as requested.
 */
export class Cache<K, V extends {}, P extends Ary = []> {
  private map = new Map<K, V>();
  constructor(private factory: Factory<K, V, P>) {}

  get loaded_size() {
    return this.map.size;
  }

  get(key: K, ...extra_params: P): V {
    const current_value = this.map.get(key);

    if (current_value != null) {
      return current_value;
    }

    const new_value = this.factory(key, ...extra_params);
    this.map.set(key, new_value);
    return new_value;
  }

  update(key: K, fn: Updater<K, V, P>, ...extra_params: P) {
    const start_value = this.get(key, ...extra_params);
    const next_value = fn(start_value, key, ...extra_params);

    this.map.set(key, next_value);
  }
}
