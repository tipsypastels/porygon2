import { Message } from 'discord.js';
import { setting } from 'porygon/settings';
import { incrementCooltrainerScore } from './score';

const ROLE_ID = setting<string>('lib.pokecom.cooltrainer.role');
const THRESHOLD = setting<number>('lib.pokecom.cooltrainer.threshold');
const PPM_EXCEPTIONS = setting<Record<string, number>>(
  'lib.pokecom.cooltrainer.ppm_exceptions',
);

export function handleCooltrainerMessage(message: Message) {
  if (message.author.bot) return;

  const { member } = message;
  const points = pointsForMessage(message);
  if (!member || !points) return;

  incrementCooltrainerScore(member, points);
}

function pointsForMessage(message: Message) {
  const { id } = message.channel;
  return PPM_EXCEPTIONS.value[id] ?? 1;
}
