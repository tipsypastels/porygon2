/* -------------------------------------------------------------------------- */
/*                                    Types                                   */
/* -------------------------------------------------------------------------- */

/**
 * Either a value or a promise to a value. Use `await` or `Promise.resolve` to
 * collapse the ambiguity.
 */
export type Awaitable<T> = T | Promise<T>;

/**
 * Either void or a promise of void. This is often the return type of throwaway
 * functions that don't *need* to be async, and will either be always `await`ed or
 * discarded.
 */
export type IntoVoid = Awaitable<void>;

/* -------------------------------------------------------------------------- */
/*                                  Utilities                                 */
/* -------------------------------------------------------------------------- */

export function sleep(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}
