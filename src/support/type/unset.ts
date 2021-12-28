/**
 * A symbol that represents an unset value. See `Unset<T>`.
 */
export const UNSET: unique symbol = Symbol('UNSET');

/**
 * A type that represents a value that may exist, or may be the symbol `UNSET`.
 *
 * This is different from `Maybe<T>` in that:
 *
 * - `T` may be `null` or `undefined` as one of its *set* values.
 * - `UNSET` must be manually provided and checked against as the default value.
 */
export type Unset<T> = T | typeof UNSET;
