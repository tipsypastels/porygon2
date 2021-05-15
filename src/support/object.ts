import fromEntries from 'object.fromentries';

type Mapper<T, R> = (from: T) => R;

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
