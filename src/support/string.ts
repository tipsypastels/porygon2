import { inspect } from 'util';

/* -------------------------------------------------------------------------- */
/*                                    Types                                   */
/* -------------------------------------------------------------------------- */

/**
 * A string or any type that may be converted into one.
 * Technically this is almost any Javascript object, but Typescript doesn't see
 * it that way.
 */
export type Stringable = string | { toString(): string };

/* -------------------------------------------------------------------------- */
/*                               Type Predicates                              */
/* -------------------------------------------------------------------------- */

/**
 * Returns whether a mysterious value is a string.
 */
export function is_string(x: unknown): x is string {
  return typeof x === 'string';
}

/**
 * Returns whether a mysterious value is a string or may be convered into one.
 */
export function is_stringable(x: unknown): x is Stringable {
  return is_string(x) || (x != null && 'toString' in <any>x);
}

/* -------------------------------------------------------------------------- */
/*                                  Utilities                                 */
/* -------------------------------------------------------------------------- */

/* ----------------------------- Capitalization ----------------------------- */

/**
 * Uppercases a string.
 */
export function upper(string: string) {
  return string.toUpperCase();
}

/**
 * Lowercases a string.
 */
export function lower(string: string) {
  return string.toLowerCase();
}

/**
 * Capitalizes a string.
 */
export function capital(string: string) {
  return upper(string[0]) + lower(string.slice(1));
}

/**
 * Pluralizes a string based on the provided count.
 * The count is prepended onto the string (if not desired, use `plural_word`).
 */
export function plural(count: number, word: string) {
  return `${count} ${plural_word(count, word)}`;
}

/**
 * Pluralizes a string based on the provided count.
 */
export function plural_word(count: number, word: string) {
  return count === 1 ? word : word + 's';
}

/* -------------------------------- Markdown -------------------------------- */

interface CodeBlockOpts {
  lang?: string;
  debug?: boolean;
}

/**
 * Wraps the message in a Discord code block.
 */
export function code_block(string: string, { lang, debug }: CodeBlockOpts = {}) {
  return `\`\`\`${lang}\n${debug ? inspect(string) : string}\`\`\``;
}

/**
 * Formats the message as markdown-bold.
 */
export const bold = (string: string) => `**${string}**`;

/**
 * Formats the message as markdown-italics.
 */
export const italics = (string: string) => `_${string}_`;

/* ------------------------------ Manipulation ------------------------------ */

const ELLIPSIS = '…';

/**
 * Slices string to `len`, including an ellipsis if the string exceeds that length.
 * This should be used for most user input in command responses.
 */
export function ellipsis(len: number, string: string) {
  return string.length > len ? `${string.slice(0, len)}${ELLIPSIS}` : string;
}

const to_source = (match: string | RegExp) => (is_string(match) ? match : match.source);

/**
 * Deletes all text matching the `pattern`.
 */
export function delete_all(pattern: string | RegExp, string: string) {
  return string.replaceAll(pattern, '');
}

/**
 * Deletes text matching `prefix` at the start of the string, and returns a new version.
 */
export function delete_prefix(prefix: string | RegExp, string: string) {
  return string.replace(new RegExp(`^${to_source(prefix)}`), '');
}

/**
 * Deletes text matching `suffix` at the end of the string, and returns a new version.
 */
export function delete_suffix(suffix: string | RegExp, string: string) {
  return string.replace(new RegExp(`${to_source(suffix)}$`), '');
}
