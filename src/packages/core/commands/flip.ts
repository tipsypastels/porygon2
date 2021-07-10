import { CommandFn, LocalCommand } from 'porygon/interaction';

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

const flip: CommandFn = async ({ embed }) => {
  const bool = Math.random() > 0.5;
  const result = bool ? FACES.heads : FACES.tails;

  await embed
    .setColor(COLOR)
    .setTitle(`${result.text}!`)
    .setDescription(result.emoji)
    .reply();
};

export default new LocalCommand(flip, { description: 'Flips a coin.' });
