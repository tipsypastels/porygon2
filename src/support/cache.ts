import { Collection } from 'discord.js';

/**
 * Same as `Collection`, but provides utility for one-liner memoization.
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
