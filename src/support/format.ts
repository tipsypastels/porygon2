import { inspect } from 'util';

/**
 * Converts a string to markdown bold.
 */
export function bold(value: string) {
  return `**${value}**`;
}

/**
 * Converts a string to markdown italics.
 */
export function italics(value: string) {
  return `_${value}_`;
}

/**
 * Converts a string to inline-code.
 */
export function code(value: string) {
  return `\`${value}\``;
}

export interface CodeBlockOpts {
  lang?: string;
  inspect?: boolean;
}

/**
 * Converts a string to a code block, optionally with a provided language.
 */
export function codeBlock(value: any, opts: CodeBlockOpts = {}) {
  if (!value) return value;
  if (opts.inspect) value = inspect(value);
  return `\`\`\`${opts.lang}\n${value}\`\`\``;
}
