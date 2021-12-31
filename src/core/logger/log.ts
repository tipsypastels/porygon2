import colors, { Color } from 'colors';
import { IS_DEBUG } from 'support/env';
import { is_string } from 'support/string';
import { print_formatted_frames } from './trace';

const error: LogErrorFn = (m, e) => __log_error(e, 'error', colors.red, m);
const warn: LogFn = (m) => __log('warn', colors.yellow, m);
const info: LogFn = (m) => __log('info', colors.blue, m);
const debug: LogFn = (m) => IS_DEBUG && __log('debug', colors.green, m);

export const logger = { error, warn, info, debug };

type LogFn = (message: string) => void;
type LogErrorFn = (message: string, error?: unknown) => void;

const KEYWORD = /%(.+?)%/g;
const PAD_LEVEL_TO = 5;

/** @internal */
export function __log(level: string, color: Color, text: string) {
  const level_text = header(level, PAD_LEVEL_TO, color);
  const time_text = time();
  const msg_text = __format(color, text);

  __do_log(`  ${level_text} ${time_text} ${msg_text}`);
}

/** @internal */
export function __log_error(error: unknown, level: string, color: Color, text: string) {
  const error_message = to_error_message(error);
  const full_text = error_message ? `${text}: %${error_message}%` : text;

  __log(level, color, full_text);

  const stack = to_error_stack(error);
  if (stack) print_formatted_frames(stack);
}

/** @internal */
export function __format(keyword_color: Color, text: string) {
  return add_period(text).replace(KEYWORD, (_, t) => keyword_color(t));
}

/** @internal */
export function __do_log(message: string) {
  (console as any)._stdout.write(`${message}\n`);
}

function header(text: string, len: number, color: Color) {
  return color.bold(`${text.toUpperCase().padEnd(len)}`);
}

function time() {
  const now = new Date();
  const stamp = now.toLocaleString('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  });

  return colors.gray.dim(stamp);
}

function to_error_message(err: unknown) {
  if (err instanceof Error) return err.message;
  if (is_string(err)) return err;
}

function to_error_stack(err: unknown) {
  if (err instanceof Error) return err.stack;
}

function add_period(text: string) {
  return text.match(/[.?!:…]%?$/) ? text : `${text}.`;
}
