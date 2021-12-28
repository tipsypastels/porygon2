import { inspect } from 'util';
import { curry } from './fn';
import { is_string } from './type';

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

const ELLIPSIS = '…';

/**
 * Slices string to `len`, including an ellipsis if the string exceeds that length.
 * This should be used for most user input in command responses.
 */
export const ellipsis = curry((len: number, string: string) => {
  return string.length > len ? `${string.slice(0, len)}${ELLIPSIS}` : string;
});

const to_source = (match: string | RegExp) => (is_string(match) ? match : match.source);

/**
 * Deletes text matching `prefix` at the start of the string, and returns a new version.
 */
export const delete_prefix = curry((prefix: string | RegExp, string: string) => {
  return string.replace(new RegExp(`^${to_source(prefix)}`), '');
});

/**
 * Deletes text matching `suffix` at the end of the string, and returns a new version.
 */
export const delete_suffix = curry((suffix: string | RegExp, string: string) => {
  return string.replace(new RegExp(`${to_source(suffix)}$`), '');
});
