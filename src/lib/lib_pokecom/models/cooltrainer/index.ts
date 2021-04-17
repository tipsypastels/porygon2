import { Message } from 'discord.js';
import { setting } from 'porygon/settings';
import { CtScoreManager } from './score';
import { CtSettings } from './settings';

export function handleCtMessage(message: Message) {
  if (message.author.bot) return;

  const { member } = message;
  const points = pointsPerMessage(message);
  if (!member || !points) return;

  CtScoreManager.increment(member, points).then((manager) => {
    manager.fetchSummary().then(console.log);
  });
}

function pointsPerMessage(message: Message) {
  const { id } = message.channel;
  return CtSettings.ppmExceptions.value[id] ?? 1;
}
