/**
 * When called in a `Task` or `Initializer` function, immediately ends the
 * execution and logs a message about skipping. Less noisy than throwing
 * an error, but accomplishes the same thing. Use if invariants are not
 * met.
 *
 * Not to be used outside of `Task` and `Initializer`, as it won't be
 * caught.
 */
export function skip_unless(cond: any, message: string): asserts cond {
  if (!cond) throw new Skip(message);
}

/**
 * @internal
 *
 * Determines if an error is the result of skipping a `Task` or `Initializer`.
 * See `skip_unless`.
 */
export function error_is_skip(e: unknown): e is Skip {
  return e instanceof Skip;
}

class Skip {
  constructor(readonly message: string) {}
}
