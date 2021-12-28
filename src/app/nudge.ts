import { add_command, ChatCommand } from 'core/command';
import { DUCK } from 'core/controller';
import { Guild } from 'discord.js';
import { random, to_sentence } from 'support/array';
import { eager, inclusive_range } from 'support/iterator';

const nudge: ChatCommand = async ({ embed, guild }) => {
  embed.color('ok').title(disaster()).about(deaths(guild));
};

add_command(DUCK, nudge, {
  name: 'nudge',
  description: 'Never use this it literally causes natural disasters.',
});

function disaster() {
  return random(DISASTERS);
}

function deaths(guild: Guild) {
  const count = Math.min(random(BASE_COUNT), guild.memberCount);
  const members = guild.members.cache.random(count);

  return `${to_sentence(members)} were killed.`;
}

const BASE_COUNT = eager(inclusive_range(3, 7));
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
