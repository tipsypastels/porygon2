import { GuildMember } from 'discord.js';

export interface Choice {
  name: string;
  emoji: string;
  beats(other: Choice): boolean;
}

export const Rock: Choice = {
  name: 'Rock',
  emoji: '🪨',
  beats: (other) => other === Scissors,
};

export const Paper: Choice = {
  name: 'Paper',
  emoji: '📰',
  beats: (other) => other === Rock,
};

export const Scissors: Choice = {
  name: 'Scissors',
  emoji: '✂️',
  beats: (other) => other === Paper,
};

export const CHOICES = [Rock, Paper, Scissors];
export const EMOJI = new Set(CHOICES.map((x) => x.emoji));
export const EMOJI_TO_CHOICES = new Map(
  CHOICES.map((choice) => [choice.emoji, choice]),
);

export type Result = {
  p1: { member: GuildMember; choice: Choice };
  p2: { member: GuildMember; choice: Choice };
  winner?: GuildMember;
};
