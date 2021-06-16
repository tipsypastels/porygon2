import { Command } from 'porygon/interaction';
import { setting } from 'porygon/settings';
import { random } from 'support/array';

const inky: Command.Fn = async ({ embed }) => {
  await embed
    .infoColor()
    .setDescription(random(MESSAGES.value))
    .poryThumb('plead')
    .reply();
};

const MESSAGES = setting('pkg.duck.inky.messages');

export default new Command(inky, { description: '🥺' });
