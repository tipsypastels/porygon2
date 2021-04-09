/**
 * Removes `never` values from an object type.
 */
export type RemoveNever<T extends Record<string, unknown>> = {
  [K in keyof T as T[K] extends never ? never : K]: T[K];
};
