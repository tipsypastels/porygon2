import { Collection } from 'discord.js';

/**
 * Same as `Collection`, but provides utility for one-liner memoization.
 * @deprecated - Use `Cache` or `AsyncCache`.
 */
export class CollectionCache<K, V> extends Collection<K, V> {
  findOr(key: K, gen: () => V) {
    const existing = this.get(key);
    if (existing) return existing;

    const created = gen();
    this.set(key, created);
    return created;
  }

  async findOrAsync(key: K, gen: () => V | Promise<V>) {
    const existing = this.get(key);
    if (existing) return existing;

    const created = await gen();
    this.set(key, created);
    return created;
  }
}

type Default<K, V, C> = (key: K, cache: C) => V;

class BaseCache<K, V> {
  protected collection = new Collection<K, V>();

  isCached(key: K) {
    return this.collection.has(key);
  }

  cache(key: K, value: V) {
    this.collection.set(key, value);
  }

  uncache(key: K) {
    this.collection.delete(key);
  }
}

export class Cache<K, V> extends BaseCache<K, V> {
  constructor(private _default: Default<K, V, Cache<K, V>>) {
    super();
  }

  get(key: K) {
    const currentValue = this.collection.get(key);

    if (typeof currentValue !== 'undefined') {
      return currentValue;
    }

    const newValue = this._default(key, this);
    this.cache(key, newValue);
    return newValue;
  }
}

export class AsyncCache<K, V> extends BaseCache<K, V> {
  constructor(private _default: Default<K, V | Promise<V>, AsyncCache<K, V>>) {
    super();
  }

  async get(key: K) {
    const currentValue = this.collection.get(key);

    if (typeof currentValue !== 'undefined') {
      return currentValue;
    }

    const newValue = await this._default(key, this);
    this.cache(key, newValue);
    return newValue;
  }
}
