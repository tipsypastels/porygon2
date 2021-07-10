/**
 * Changes `K` to be optional, leaving other properties unaffected.
 */
export type PartialKey<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
