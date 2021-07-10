import { OWNER } from 'secrets.json';
import { IdLike, resolveId } from 'support/like';
import { Porygon } from './client';

export function isOwner(user: IdLike) {
  return resolveId(user) === OWNER;
}

export function assertOwner(user: IdLike) {
  if (isOwner(user)) {
    return;
  }

  throw new Error('This functionality can only be used by the bot owner.');
}

export function findOwner(client: Porygon) {
  return client.users.cache.get(OWNER);
}
