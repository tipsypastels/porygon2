/* -------------------------------------------------------------------------- */
/*                                    Types                                   */
/* -------------------------------------------------------------------------- */

/**
 * A mapped type that removes values of type `never`. For generic types that *may*
 * need additional values (such as for configuration), but often won't and don't
 * the boilerplate of specifying an empty `{}`.
 */
export type Possible<T extends {}> = {
  [K in keyof T as T[K] extends never ? never : K]: T[K];
};

/**
 * Represents a value that *may* be used directly, or may exist on
 * an object with a known property name. An example is `IntoEmbed`,
 * which can either be a function or an `into_embed` method.
 *
 * Use `from_indirect` to resolve such values.
 */
export type Indirect<K extends string, V> = V | Record<K, V>;

/* -------------------------------------------------------------------------- */
/*                               Type Predicates                              */
/* -------------------------------------------------------------------------- */

/**
 * Returns whether a mysterious value is an object (NOT including functions and arrays)
 */
export function is_object(value: unknown): value is object {
  return typeof value === 'object' && !Array.isArray(value);
}

/* -------------------------------------------------------------------------- */
/*                                  Utilities                                 */
/* -------------------------------------------------------------------------- */

/**
 * @see Indirect
 */
export function from_indirect<K extends string, V>(indirect: Indirect<K, V>, key: K): V {
  return is_direct(indirect, key) ? indirect : indirect[key];
}

function is_direct<K extends string, V>(i: Indirect<K, V>, key: K): i is V {
  return !(is_object(i) && key in i);
}

/**
 * Returns a function that gets a specific key of an object.
 * Useful for map operations that just look up a fixed key.
 */
export function pluck<T, K extends keyof T>(key: K) {
  return (t: T) => t[key];
}
