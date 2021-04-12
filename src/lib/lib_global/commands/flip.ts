import { Command } from 'interaction/command';

const COLOR = 'E1A339';
const FACES = {
  heads: {
    text: 'Heads',
    emoji: '<:heads:831074796925091861>',
  },
  tails: {
    text: 'Tails',
    emoji: '<:tails:831074797294845952>',
  },
};

interface Args {
  headsText?: string;
  tailsText?: string;
}

const flip: Command<Args> = ({ opts, embed }) => {
  const bool = Math.random() > 0.5;
  const result = bool ? FACES.heads : FACES.tails;
  const customText = bool ? opts.headsText : opts.tailsText;
  const text = customText ?? result.text;

  embed
    .setTitle('Coin Flip')
    .okColor()
    .setDescription(`${result.emoji} ${text}`)
    .reply();
};

flip.description = 'Flips a coin.';
flip.options = [
  {
    name: 'headsText',
    type: 'STRING',
    required: false,
    description: 'Changes the text of the heads result.',
  },
  {
    name: 'tailsText',
    type: 'STRING',
    required: false,
    description: 'Changes the text of the tails result.',
  },
];

export default flip;
