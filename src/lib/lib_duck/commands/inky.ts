import { Command } from 'interaction/command';
import { getValue } from 'lib/lib_value';
import { random } from 'support/array';

const inky: Command = async ({ interaction }) => {
  const messages = await getValue('inky.messages', MESSAGES);

  interaction.reply(random(messages));
};

inky.description = '🥺';

const MESSAGES = [
  '🥺',
  '<:femmeduck:773701798292095008>',
  "haven't you people heard of closing the goddamn door",
  'omg',
  'wow Pb why u so old?',
  'When I was a young boy, my father took me into the city, to see a marching band. He said, "Son, when you grow up, would you be the savior of the broken, the beaten, and the damned?" He said, "Will you defeat them, your demons, and all the non-believers? The plans that they have made? Because one day, I\'ll leave you, a phantom to lead you in the summer... To join the black parade."',
  'pleading is the most fun an inky can have without taking his clothes off',
  'periodt',
  'PB is my bwestest fwend uwu',
];

export default inky;
