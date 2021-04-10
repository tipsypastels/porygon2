import { createStore } from 'porygon/store';
import { chooseIfDev, DevProdChoice } from 'support/dev';

const store = createStore('lib.values');
const cache = new Map<string, any>();

type Initial<T> = T | DevProdChoice<T>;

export async function getValue<T>(key: string, initial: Initial<T>) {
  const cached = cache.get(key);
  if (cached != null) return cached as T;
  console.log('not cached');

  const saved = await store.get(key);
  console.log({ saved });
  if (saved != null) return saved as T;
  console.log('not saved');

  return initial != null && 'prod' in initial ? chooseIfDev(initial) : initial;
}

export async function setValue<T>(key: string, value: T) {
  cache.set(key, value);
  await store.set(key, value);
}
