import fromEntries from 'object.fromentries';
import { inspect } from 'util';

type AnyObject = Record<string, unknown>;
type Mapper<T, R> = (from: T) => R;
type KeyMapper = Mapper<string, string>;

export function objectIsEmpty(object: Record<string, unknown>) {
  return Object.keys(object).length === 0;
}

export function mapToObject<T, K extends PropertyKey, V>(
  items: T[],
  map: Mapper<T, [K, V]>,
) {
  return fromEntries(items.map(map)) as Record<K, V>;
}

export function mapToObjectWithKeys<K extends PropertyKey, V>(
  items: K[],
  map: Mapper<K, V>,
) {
  return fromEntries(items.map((key) => [key, map(key)])) as Record<K, V>;
}

export function extractOnlyKey<T>(obj: T) {
  const keys = Object.keys(obj) as (keyof T)[];

  if (keys.length === 0) {
    throw new Error('extractOnlyKey: Failed on empty object.');
  }

  if (keys.length > 1) {
    throw new Error(`extractOnlyKey: Got multiple keys: ${inspect(keys)}.`);
  }

  return keys[0];
}

export function transformKeys(object: AnyObject, map: KeyMapper) {
  const out: AnyObject = {};

  for (const [key, value] of Object.entries(object)) {
    out[map(key)] = value;
  }

  return out;
}
