import { Command } from 'interaction/command';
import { setting } from 'porygon/settings';
import { random } from 'support/array';

const inky: Command = async ({ embed }) => {
  await embed
    .infoColor()
    .setDescription(random(MESSAGES.value))
    .poryThumb('plead')
    .reply();
};

inky.description = '🥺';

const MESSAGES = setting('lib.duck.inky.messages');

export default inky;
