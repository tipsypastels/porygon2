/**
 * Whether the bot is assumed to be running locally under `ts-node` in development mode.
 * This doesn't control *much*, as configuration is better left to the other two flags,
 * but it will affect things like whether `CODE_ROOT` includes `src` (dev) or `dist` (prod).
 *
 * There is no `dev()` equivalent of the builtin `staging()` and `debug()` ternary
 * functions as a sort of lint against using it that way, since most of the time `staging()`
 * does what you want.
 *
 * It is intended to be valid to run without `IS_DEV` locally, usually to test the build
 * pipeline, while keeping `IS_STAGING` and `IS_DEBUG` enabled.
 */
export const IS_DEV = process.env.NODE_ENV === 'development';

/**
 * Whether the bot assumes itself to be on the Porygon staging server and no other. This
 * affects, for example, whether controllers are replaced with `STAGING_OVERRIDE`, and
 * the value returned by the `staging()` ternary function.
 */
export const IS_STAGING = !!process.env.PORY_STAGING;

/**
 * Whether debug logging is enabled for the bot. This is always true in development, but
 * may be enabled in production as well.
 */
export const IS_DEBUG = !!process.env.PORY_DEBUG;

/**
 * Returns the first value if in staging, and the second one otherwise.
 */
export const staging = <T>(dev: T, prod: T) => (IS_STAGING ? dev : prod);

/**
 * Returns the first value if in debug, and the second otherwise.
 */
export const debug = <T>(debug: T, prod: T) => (IS_DEBUG ? debug : prod);
