import { CommandFn, LocalCommand } from 'porygon/interaction';
import { setting } from 'porygon/settings';
import { random } from 'support/array';

const inky: CommandFn = async ({ embed }) => {
  await embed
    .infoColor()
    .setDescription(random(MESSAGES.value))
    .poryThumb('plead')
    .reply();
};

const MESSAGES = setting('pkg.duck.inky.messages');

export default new LocalCommand(inky, { description: '🥺' });
