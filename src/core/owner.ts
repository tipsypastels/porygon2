import { Client } from 'discord.js';
import { OWNER } from 'support/env';

interface User {
  id: string;
}

export function is_owner(user: User) {
  return user.id === OWNER();
}

export function assert_owner(user: User) {
  if (!is_owner(user)) throw new Error("You aren't the bot owner!");
}

export function find_owner(client: Client) {
  return client.users.cache.get(OWNER());
}
