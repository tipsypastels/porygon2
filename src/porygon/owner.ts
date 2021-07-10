import { OWNER } from 'secrets.json';
import { Porygon } from './client';

interface User {
  id: string;
}

export function isOwner(user: User) {
  return user.id === OWNER;
}

export function assertOwner(user: User) {
  if (isOwner(user)) {
    return;
  }

  throw new Error('This functionality can only be used by the bot owner.');
}

export function findOwner(client: Porygon) {
  return client.users.cache.get(OWNER);
}
