/**
 * There's no value in treating `null` and `undefined` seperately or worrying about
 * which to use. Make them into a single type and save yourself some brain space.
 */
export type None = null | undefined;

/**
 * A `None` value. See `None`.
 */
export const NONE: None = undefined;

/**
 * A nullable type. See `None`.
 */
export type Maybe<T extends {}> = T | null | undefined;

/**
 * Checks whether a `Maybe<T>` is non-nullish (ie, assignable to `{}`).
 */
export function is_some<T>(value: Maybe<T>): value is T {
  return value != null;
}

/**
 * Checks whether a `Maybe<T>` is null or undefined.
 */
export function is_none<T>(value: Maybe<T>): value is null | undefined {
  return value == null;
}

/**
 * If the value is present, calls the function with it and returns the result.
 * Does nothing and returns `NONE` unchanged otherwise.
 */
export function map_maybe<T, R>(fn: (t: T) => R, val: Maybe<T>): Maybe<R> {
  if (val) return fn(val);
}
