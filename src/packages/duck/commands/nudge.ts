import { Guild } from 'discord.js';
import { CommandFn, LocalCommand } from 'porygon/interaction';
import { setting } from 'porygon/settings';
import { random, range, toSentence } from 'support/array';

const nudge: CommandFn = async ({ guild, embed }) => {
  await embed.okColor().setTitle(disaster()).setDescription(deaths(guild)).reply();
};

export default new LocalCommand(nudge, {
  description: 'Never use this it literally causes natural disasters.',
});

function disaster() {
  return random(DISASTERS.value);
}

function deaths(guild: Guild) {
  const count = Math.min(random(BASE_COUNT), guild.memberCount);
  const members = guild.members.cache.random(count);

  return `${toSentence(members)} were killed.`;
}

const BASE_COUNT = range(3, 7);
const DISASTERS = setting('pkg.duck.nudge.disasters');
