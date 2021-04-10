/**
 * Shorthand for whether development mode is enabled.
 */
export const isDev = process.env.NODE_ENV === 'development';

/**
 * Represents a value that may be provided literally, or wrapped
 * in an object with `dev` and `prod` keys.
 */
export type EnvWrapper<T> = T | { prod: T; dev: T };

/** @see EnvWrapper */
export function unwrapEnv<T>(wrapper: EnvWrapper<T>): T {
  if ('prod' in wrapper) {
    return wrapper[isDev ? 'dev' : 'prod'];
  }

  return wrapper;
}
