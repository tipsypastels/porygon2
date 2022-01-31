import { PrismaClient } from '@prisma/client';
import { logger, panic } from './logger';
export const $db = new PrismaClient();

export function connect_db() {
  return $db
    .$connect()
    .then(() => logger.debug('%Database connected!%'))
    .catch((e: Error) => panic(`Database disconnected! ${e.message}`));
}
