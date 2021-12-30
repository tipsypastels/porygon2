import { Maybe } from './null';

/**
 * Creates an iterator over two seperate iterators, yields items from them
 * together as a tuple until either finishes.
 */
export function* zip<A, B>(a: Iterable<A>, b: Iterable<B>) {
  const a_iter = a[Symbol.iterator]();
  const b_iter = b[Symbol.iterator]();

  for (;;) {
    const a = a_iter.next();
    const b = b_iter.next();

    if (a.done || b.done) {
      break;
    }

    yield <const>[a.value, b.value];
  }
}

/**
 * Causes eager evaluation of an iterable, converting it into an array.
 */
export function eager<T>(iter: Iterable<T>) {
  return Array.from(iter);
}

/**
 * Maps each item in an iterable sequence by the provided function.
 * Unlike Array#map, this works on any iterable, and does not create
 * an array.
 */
export function* map<T, R>(fn: (t: T) => R, iter: Iterable<T>) {
  for (const t of iter) yield fn(t);
}

/**
 * Retrieves a key from each item in an iterable sequence.
 * Shorthand for the common pattern of:
 *
 *     const items = [...];
 *     const values = items.map(i => i.value);
 *
 */
export function* map_key<T, K extends keyof T>(key: K, iter: Iterable<T>) {
  yield* map((item) => item[key], iter);
}

/**
 * Joins an iterable with a delimiter, eagerly evaluating each item.
 */
export function join(delim: string, iter: Iterable<any>) {
  return eager(iter).join(delim);
}

/**
 * Skips the first `n` items of the provided iterator, yielding the rest.
 */
export function* skip<T>(n: number, iter: Iterable<T>) {
  let i = 0;
  for (const elem of iter) {
    if (i >= n) yield elem;
    i++;
  }
}

/**
 * Yields while the predicate is true, then stops forever.
 */
export function* take_while<T>(pred: (t: T) => Maybe<boolean>, iter: Iterable<T>) {
  for (const elem of iter) {
    if (!pred(elem)) break;
    yield elem;
  }
}

/**
 * Yields each item from `min` to `max`, inclusive.
 */
export function* inclusive_range(min: number, max: number) {
  if (min > max) throw new Error('Negative range!');

  for (let i = min; i <= max; i++) {
    yield i;
  }
}

/**
 * Yields each item from `min` to `max`, exclusive.
 */
export function* exclusive_range(min: number, max: number) {
  yield* inclusive_range(min, max - 1);
}

/**
 * Creates an object out of an iterator of key-value pairs.
 */
export function from_entries<K extends PropertyKey, V>(iter: Iterable<readonly [K, V]>) {
  return Object.fromEntries(iter);
}
