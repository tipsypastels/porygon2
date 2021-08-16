/**
 * A rundown of the error system.
 *
 * Because embeds are near universal in Porygon, and often used for passing
 * messages between different parts of the system to collectively build up
 * the final user output, many Porygon functions, especially those related
 * to commands, will throw an "embedded error" - an error which is really
 * just an `IntoEmbed`.
 *
 * This embed will be caught by command handlers (and anywhere else that
 * might need it) and identified using the `isEmbeddedError` predicate.
 * From there, it can just be merged into an embed as any output would.
 *
 * The `embeddedError` function can be used directly, or indirectly via
 * factories like `embeddedError.warn`, which layer on common shared UI
 * such as warning colours and thumbnails.
 */

import { IntoEmbedFn } from './embed';

const TAG = Symbol('embeddedError');

export interface EmbeddedError {
  [TAG]: true;
  intoEmbed: IntoEmbedFn;
  ephemeral: boolean;
}

export function isEmbeddedError(error: unknown): error is EmbeddedError {
  return !!(error && typeof error === 'object' && TAG in error);
}

/**
 * Creates an embedded error. Try to use `embeddedError.warn`, `embeddedError.danger`,
 * or `embeddedError.error` when possible, as it's best to standardize these things,
 * and they still let you customize nearly as much.
 *
 * This function can be used for completely custom error embeds if needed.
 */
export function embeddedError(fn: IntoEmbedFn, { ephemeral = false } = {}) {
  return { [TAG]: true, intoEmbed: fn, ephemeral };
}

const WARN: IntoEmbedFn = (e) => e.poryThumb('warning').poryColor('warning');
const DANGER: IntoEmbedFn = (e) => e.poryThumb('danger').poryColor('danger');
const ERROR: IntoEmbedFn = (e) => e.poryThumb('error').poryColor('error');

/**
 * Warnings should be used for non-malicious and non-critical errors. Examples:
 *
 *     - Malformed parameters
 *     - No such item
 *     - Nothing to do
 */
embeddedError.warn = create(WARN);

/**
 * Same as `embeddedError.warn`, but sends as an ephemeral embed once caught.
 * @see embeddedError.warn
 */
embeddedError.warnEph = create(WARN, { ephemeral: true });

/**
 * Danger should be used for non-critical errors where the user is probably
 * trying to do something weird or unsupported on purpose. Examples:
 *
 *     - Can't remove another user's pets
 *     - Can't request the moderoid role
 */
embeddedError.danger = create(DANGER);

/**
 * Same as `embeddedError.danger`, but sends as an ephemeral embed once caught.
 * @see embeddedError.danger
 */
embeddedError.dangerEph = create(DANGER, { ephemeral: true });
/**
 * Error should be used for critical errors, whether user-caused or not. Critical errors
 * are those where it is probably not possible to give the user an explanation of what
 * they did wrong or tell them to try again. Examples:
 *
 *     - Command handler threw
 *     - Service unavailable
 */
embeddedError.error = create(ERROR);

/**
 * Same as `embeddedError.error`, but sends as an ephemeral embed once caught.
 * @see embeddedError.error
 */
embeddedError.errorEph = create(ERROR, { ephemeral: true });

function create(base: IntoEmbedFn, { ephemeral = false } = {}) {
  return (fn?: IntoEmbedFn) =>
    embeddedError((e) => e.merge(base).merge(fn), { ephemeral });
}