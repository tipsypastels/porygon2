import Keyv from 'keyv';
import { DB, DB_USERNAME, DB_PASSWORD } from 'secrets.json';
import { logger } from './logger';

const dbPath = `postgresql://${DB_USERNAME}:${DB_PASSWORD}@localhost:5432/${DB}`;
console.log(dbPath);

export function createStore(namespace: string) {
  const store = new Keyv(dbPath, { namespace, adapter: 'postgres' });

  store.on('error', (error) => {
    logger.error(`Keyv connection error: ${error}`);
  });

  return store;
}
