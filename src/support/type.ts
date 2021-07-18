/**
 * Changes `K` to be optional, leaving other properties unaffected.
 */
export type PartialKey<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * Changes `K` to be required, leaving other properties unaffected.
 */
export type RequiredKey<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

/**
 * Converts a union to an intersection.
 *
 * Note that incompatible shapes, such as two string literal types, will
 * produce `never`.
 */
export type Intersect<U> = (U extends any ? (k: U) => void : never) extends (
  k: infer I,
) => void
  ? I
  : never;

/**
 * An object with no properties.
 */
export type Empty = Record<PropertyKey, never>;
