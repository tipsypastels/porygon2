import cron from 'node-cron';
import { logger } from './logger';

export function schedule(name: string, time: string, fn: () => void) {
  logger.task.info(`Task scheduled: ${name} at ${time}`);
  cron.schedule(time, fn);
}
