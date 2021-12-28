import colors from 'colors';
import { __log_error } from './log';
import { current_error } from './trace';

export function assert(cond: any, message: string): asserts cond {
  if (!cond) panic(message);
}

export function panic(message: string, error?: unknown): never {
  __log_error(error ?? current_error(), 'PANIC', colors.red, message);
  process.exit(1);
}
