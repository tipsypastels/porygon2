import { Guild } from 'discord.js';
import { Command } from 'interaction/command';
import { random, range, toSentence } from 'support/array';

const nudge: Command = async ({ guild, embed, reply }) => {
  embed.okColor().setTitle(disaster()).setDescription(deaths(guild));

  await reply(embed);
};

nudge.description = 'Never use this it literally causes natural disasters.';

export default nudge;

function disaster() {
  return random(DISASTERS);
}

function deaths(guild: Guild) {
  const count = Math.min(random(BASE_COUNT), guild.memberCount);
  const members = guild.members.cache.random(count);

  return `${toSentence(members)} were killed.`;
}

const BASE_COUNT = range(3, 7);
const DISASTERS = [
  'Buildings crumble',
  'Earthquakes makin their way downtown ziggin fast',
  'Cookies crumble',
  'Groudon: Emerges',
  'A Porytude 7 earthquake!',
  'Just imagine Discord shaking',
  'Cars tumble down the roads',
  'Earthquakes are uncomf',
  'Hundreds of books drop from the shelves',
  'All the chairs roll away',
  'Vases fall and shatter',
  'A glass of water spills',
  'A plant falls over leaving dirt everywhere',
  'Random ceiling tiles fall down',
  'The floor shakes and cracks',
];
