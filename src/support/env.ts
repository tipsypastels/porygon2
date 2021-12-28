/**
 * Whether the bot is running locally in development mode.
 */
export const IS_DEV = process.env.NODE_ENV === 'development';

/**
 * Whether debug logging is enabled for the bot. This is always true in development,
 * or if the environment variable `PORY_DEBUG` has any value.
 */
export const IS_DEBUG = IS_DEV || !!process.env.PORY_DEBUG;

/**
 * Returns the first value if in development, and the second one otherwise.
 */
export const dev = <T>(dev: T, prod: T) => (IS_DEV ? dev : prod);

/**
 * Returns the first value if in debug, and the second otherwise.
 */
export const debug = <T>(debug: T, prod: T) => (IS_DEBUG ? debug : prod);
