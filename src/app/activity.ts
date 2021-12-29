import { GLOBAL } from 'core/controller';
import { add_init, add_task, Task } from 'core/initializer';
import { logger } from 'core/logger';
import { random } from 'support/array';

const set_activity: Task = ({ client }) => {
  const { user } = client;

  if (!user) {
    return logger.warn('Tried to set an activity message before ready.');
  }

  user.setActivity(random(MESSAGES));
};

add_init(GLOBAL, set_activity);
add_task(GLOBAL, set_activity, { run_at: '*/30 * * * *', quiet: true });

const MESSAGES = [
  'cyberduck supreme',
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
];
