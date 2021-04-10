/**
 * Shorthand for whether development mode is enabled.
 */
export const isDev = process.env.NODE_ENV === 'development';

export type DevProdChoice<T> = { dev: T; prod: T };

/**
 * Returns `prod` if production, `dev` is development. Quick and easy way
 * to do a binary choice.
 */
export function chooseIfDev<T>(prod: T, dev: T): T;
export function chooseIfDev<T>(choices: DevProdChoice<T>): T;
export function chooseIfDev(...args: any[]) {
  if (args.length === 2) {
    return isDev ? args[1] : args[0];
  }

  return args[0][isDev ? 'dev' : 'prod'];
}
