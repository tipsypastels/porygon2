import { Porygon } from './client';
import { schedule } from './schedule';
import { setting } from './settings';
import { random } from 'support/array';

export function setupActivityMessages(client: Porygon) {
  set(client);
  schedule('pory.activity', '0,30 * * * *', () => set(client));
}

function set(client: Porygon) {
  const { user } = client;
  if (!user) return;

  user.setActivity(random(ACTIVITY_MESSAGES.value));
}

const ACTIVITY_MESSAGES = setting('pory.activity_messages');
