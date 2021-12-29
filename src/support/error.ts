import { delete_all, is_string } from './string';
import { DATABASE_URL, TOKEN } from 'support/env';
import { Maybe } from './null';

/**
 * Returns the error message of an unknown error, if it exists.
 * The error message is:
 *  - The `message` property of an `Error` instance.
 *  - The value of a `string`.
 *  - `None` in all other cases.
 */
export function get_error_message(err: unknown) {
  if (err instanceof Error) return err.message;
  if (is_string(err)) return err;
}

/**
 * Same as `get_error_message`, but removes any reference to potentially secret
 * variables. Should be used for errors that will be displayed to the user.
 */
export function get_scrubbed_error_message(err: unknown) {
  return scrub(get_error_message(err));
}

function scrub(string: Maybe<string>) {
  if (string) {
    return delete_all(TOKEN(), delete_all(DATABASE_URL(), string));
  }
}

/**
 * Returns the stack of an unknown error, if it is an `Error` instance.
 */
export function get_error_stack(err: unknown) {
  if (err instanceof Error) return err.stack;
}
