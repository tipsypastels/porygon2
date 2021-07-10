/**
 * A value that either *is* or contains an ID property.
 */
export type IdLike = string | { id: string };

/** @see IdLike */
export function resolveId(like: IdLike) {
  return typeof like === 'string' ? like : like.id;
}
