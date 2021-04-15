import { Message } from 'discord.js';
import { Setting } from 'porygon/settings';
import { incrementCooltrainerScore } from './score';

const ROLE_ID = new Setting('ct.role', {
  dev: '775261617805459486',
  prod: '531984098038775842',
});

const THRESHOLD = new Setting('ct.threshold', {
  dev: 10,
  prod: 600,
});

const PPM_EXCEPTIONS = new Setting<Record<string, number>>('ct.ppme', {
  dev: {
    '775630182521634846': 0, // a
  },
  prod: {
    '185850117918556161': 0, // discordia
    '423905036859604993': 0, // logs
    '613756774234718209': 0, // warnings
    '159086206385258496': 0, // staff
    '722939153242652723': 0, // welcome
    '603285325334446090': 0, // server-suggestions
    '162925288362082304': 0, // random
    '469134262462054400': 0, // bot-testing
    '469134365952049193': 0, // bot-discussion
    '582487187409469440': 0, // bot-command-spam

    '222724364276072448': 2, // writers-desk
    '182278504648278017': 2, // artist-studio
    '211178182856933376': 2, // trading-card-game
    '239067868174483456': 2, // anime-and-manga
  },
});

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
