import { camel_response_for_message as camel } from '.';

const DROM = '🐪';
const BACT = '🐫';

const CAMELS = [
  { name: 'dromedary', emote: DROM },
  { name: 'bactiran', emote: BACT },
];

function resp(count = 1) {
  return 'yo '.repeat(count);
}

describe(camel, () => {
  it('returns nothing for an empty message', () => {
    expect(camel('')).toBeUndefined();
  });

  it('returns nothing for a generic string', () => {
    expect(camel('hello, world!')).toBeUndefined();
  });

  it('returns nothing for a string with camels and other characters', () => {
    expect(camel(`${DROM} is a dromedary camel!`)).toBeUndefined();
  });

  for (const { name, emote } of CAMELS) {
    it(`returns 1 yo for a ${name} camel`, () => {
      expect(camel(emote)).toEqual(resp());
    });

    it(`returns 2 yo's for two ${name} camels`, () => {
      expect(camel(emote + emote)).toEqual(resp(2));
    });

    it(`returns 5 yo's for five ${name} camels`, () => {
      expect(camel(emote.repeat(5))).toEqual(resp(5));
    });

    it(`does not consider whitespace for ${name} camels`, () => {
      expect(camel(`${emote}   \t${emote}\n${emote}`)).toEqual(resp(3));
    });

    it(`caps at 100 ${name} camels`, () => {
      expect(camel(emote.repeat(101))).toEqual(resp(100));
    });
  }

  it('counts mixed camel distribution correctly', () => {
    expect(camel(`${DROM} ${BACT} ${DROM}`)).toEqual(resp(3));
  });
});
