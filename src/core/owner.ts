import { Client } from 'discord.js';
import { OWNER } from 'support/env';
import { assert } from './assert';

interface User {
  id: string;
}

export function is_owner(user: User) {
  return user.id === OWNER();
}

export function assert_owner(user: User) {
  assert(is_owner(user), "You aren't the bot owner!");
}

export function find_owner(client: Client) {
  return client.users.cache.get(OWNER());
}
