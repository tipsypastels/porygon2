import { Guild } from 'discord.js';
import { OWNER } from 'support/env';
import { assert } from './assert';
import { ClientWithoutEvents } from './initializer';

interface User {
  id: string;
}

export function is_owner(user: User) {
  return user.id === OWNER();
}

export function assert_owner(user: User) {
  assert(is_owner(user), "You aren't the bot owner!");
}

export function fetch_owner(client: ClientWithoutEvents) {
  return client.users.fetch(OWNER());
}

export function fetch_owner_on(guild: Guild) {
  return guild.members.fetch(OWNER());
}
