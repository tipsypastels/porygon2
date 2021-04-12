import { Porygon } from './client';
import { schedule } from './schedule';
import { Setting } from './settings';
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

const ACTIVITY_MESSAGES = new Setting('pory.activity_messages', [
  'cyberduck supreme',
  'mining bitcoin',
  'just vibing',
  'drunk internet duck',
  'Duck Game',
  'downloading more ram',
  'plotting against dakota',
  'planning a coup',
  'high on potenuse',
  'hacking the mainframe',
  'deleting the database',
  'beep boop. error',
  'how are you?',
  'taking a nap',
  'sleeping in class',
  'in a duck pond',
  'ducking around',
  'calculating...',
  'using math for evil',
  'writing more statuses',
  'press ctrl-c to quit',
  'dumb',
  'committing crimes',
  'being gay, doing crimes',
  'MCR — Black Parade',
  'quacking in the matrix',
  'porygone to the store',
  'stanning inky',
  'beating up geese',
  'eatin quackers',
  'doing hot bot shit',
  'playing with firequackers',
  'hey got any grapes',
  'remaking the remakes',
  'duck duck goose',
  'daffy-duck',
  'watching an*me',
  'release the quacken!',
  'hugging minecraft bee',
  'doing communism',
  'when i was a young duck',
  'no thots head empty',
  'mining duckcoin',
]);
