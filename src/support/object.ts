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
