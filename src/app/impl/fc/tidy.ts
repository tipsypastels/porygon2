import { Maybe } from 'support/null';

const SYNTAX = /^\d{4}-\d{4}-\d{4}$/;

const SPACES = / +/g;
const NON_TERMINAL_GROUPS_OF_FOUR = /(\d{4})(?=\d)/g;

/**
 * Tidies up a provided friend code, letting the rules for user input be looser
 * than the actual format used in the database. This mostly just means that the
 * section separating dashes may be omitted or replaced with spaces.
 */
export function try_tidy_fc(code: string): Maybe<string> {
  const tidied_code = code
    .replace(SPACES, '-')
    .replace(NON_TERMINAL_GROUPS_OF_FOUR, '$1-');

  if (tidied_code.match(SYNTAX)) {
    return tidied_code;
  }
}
