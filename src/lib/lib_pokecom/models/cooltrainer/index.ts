import { Message } from 'discord.js';
import { CtScoreManager } from './score';
import { CtSettings } from './settings';

export * from './score';
export * from './scoreboard';
export * from './tick';
export * from './cycle';

export function handleCtMessage(message: Message) {
  if (message.author.bot) return;

  const { member } = message;
  const points = pointsPerMessage(message);
  if (!member || !points) return;

  CtScoreManager.increment(member, points);
}

function pointsPerMessage(message: Message) {
  const { id } = message.channel;
  return CtSettings.ppmExceptions.value[id] ?? 1;
}
