import colors, { Color } from 'colors';

export type { Color };

/** @internal */
export const LOG_COLORS = {
  error: colors.red,
  warn: colors.yellow,
  info: colors.blue,
  debug: colors.green,
  aside: colors.gray.dim,
};
