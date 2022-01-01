import { Ary } from './array';
import { Awaitable } from './async';
import { is_some } from './null';
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
 * The status of a value from a `Cache` or `AsyncCache`.
 */
export type CacheStatus<V> = [value: V, preexisting: boolean];

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
    return this.get_with_status(key, ...extra_params)[0];
  }

  get_with_status(key: K, ...extra_params: P): CacheStatus<V> {
    const current_value = this.map.get(key);

    if (is_some(current_value)) {
      return [current_value, true];
    }

    const new_value = this.factory(key, ...extra_params);
    this.map.set(key, new_value);
    return [new_value, false];
  }

  update(key: K, fn: Updater<K, V, P>, ...extra_params: P) {
    const start_value = this.get(key, ...extra_params);
    const next_value = fn(start_value, key, ...extra_params);

    this.map.set(key, next_value);
  }
}

/**
 * Asynchronous version of `Cache<K, V, P>`.
 */
export class AsyncCache<K, V extends {}, P extends Ary = []> {
  private map = new Map<K, V>();
  constructor(private factory: Factory<K, Awaitable<V>, P>) {}

  get loaded_size() {
    return this.map.size;
  }

  get(key: K, ...extra_params: P): Promise<V> {
    return this.get_with_status(key, ...extra_params).then((x) => x[0]);
  }

  async get_with_status(key: K, ...extra_params: P): Promise<CacheStatus<V>> {
    const current_value = this.map.get(key);

    if (is_some(current_value)) {
      return [current_value, true];
    }

    const new_value = await this.factory(key, ...extra_params);
    this.map.set(key, new_value);
    return [new_value, false];
  }

  async update(key: K, fn: Updater<K, Awaitable<V>, P>, ...extra_params: P) {
    const start_value = await this.get(key, ...extra_params);
    const next_value = await fn(start_value, key, ...extra_params);

    this.map.set(key, next_value);
  }
}

/**
 * A set-like container. Provides a method to add a value and check whether
 * it was actually added (`true`) or already present (`false`).
 */
export class OnceSet<T> {
  private set = new Set<T>();

  try_add(value: T) {
    if (this.set.has(value)) {
      return false;
    }

    this.set.add(value);
    return true;
  }
}
