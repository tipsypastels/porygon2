import { embeddedError } from 'porygon/embed/errors';
import { createLang } from 'porygon/lang';

export function diceParseError(roll: string): never {
  throw embeddedError.warn((e) => {
    e.setTitle(lang('title'))
      .setDescription(lang('desc', { roll }))
      .addField(lang('ex1.code'), lang('ex1.desc'))
      .addField(lang('ex2.code'), lang('ex2.desc'))
      .addField(lang('ex3.code'), lang('ex3.desc'));
  });
}

const lang = createLang(<const>{
  title: "That's not a valid dice roll :(",
  desc: "Looks like you passed in {roll}, which isn't valid. The `/roll` command uses standard Dice Notation. Here are some examples of what's accepted.",
  ex1: {
    code: '/roll 1d6',
    desc: 'Rolls one die with six faces.',
  },
  ex2: {
    code: '/roll 4d20',
    desc: 'Rolls four dice with twenty faces apiece.',
  },
  ex3: {
    code: '/roll 2d6+12',
    desc: 'Rolls two dice with six faces apiece, then adds twelve to each result.',
  },
});
