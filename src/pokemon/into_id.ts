import type { Base } from './models/base';

/**
 * An object that can be either an ID, or a data class of type `T` containing
 * an ID. Used for functions that just need to get the ID out but can
 * handle being passed a full object.
 */
export type IntoId<T extends Base<any>> = T | string;

/**
 * Converts an `IntoId<T>` into the underlying ID.
 * @see IntoId
 */
export function intoId<T extends Base<any>>(from: IntoId<T>) {
  return typeof from === 'string' ? from : from.id;
}
