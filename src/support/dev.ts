/**
 * Shorthand for whether development mode is enabled.
 */
export const isDev = process.env.NODE_ENV === 'development';

/**
 * Returns `prod` if production, `dev` is development. Quick and easy way
 * to do a binary choice.
 */
export const chooseIfDev = <T>(prod: T, dev: T) => (isDev ? dev : prod);
