import { logger } from 'core/logger';
import { TimeDifference } from 'core/stat/time';
import { Seconds } from 'support/time';
import { Middleware } from '..';

/**
 * Middleware that logs commands that take too long to complete.
 */
export const slow_timing: Middleware<any, any, any> = function* (_, cell) {
  const time = TimeDifference.start_timing();
  yield;

  const difference = time.difference;

  if (difference > Seconds(2)) {
    const seconds = Math.ceil(difference / 1000);
    logger.warn(`Command %${cell.name}% took %${seconds}s% to finish!`);
  }
};
