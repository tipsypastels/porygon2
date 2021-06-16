import { Collection } from 'discord.js';

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

const UNSET_SENTINEL: unique symbol = Symbol('UNSET_SENTINEL');

export class Singleton<T> {
  private value: T | typeof UNSET_SENTINEL = UNSET_SENTINEL;
  constructor(private _default: () => T) {}

  get() {
    if (this.value === UNSET_SENTINEL) {
      this.value = this._default();
    }

    return this.value;
  }
}
