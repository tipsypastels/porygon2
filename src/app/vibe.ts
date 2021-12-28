import { add_command, ChatCommand } from 'core/command';
import { DUCK } from 'core/controller';
import { random } from 'support/array';
import { bold } from 'support/string';

const vibe: ChatCommand = async ({ embed, author }) => {
  const { displayName: name } = author;
  const pos = trait(POSITIVE);
  const neg = trait(NEGATIVE);

  embed
    .pory('vibe')
    .color('info')
    .author('✨ 𝓋𝒾𝒷𝑒 𝒸𝒽𝑒𝒸𝓀 ✨')
    .title(`${name}'s vibe`)
    .about(`${name} is ${neg} but makes up for it by ${pos}.`);
};

add_command(DUCK, vibe, {
  name: 'vibe',
  description: 'Scientifically analyzes your vibes.',
});

function trait(list: string[]) {
  return bold(random(list));
}

const NEGATIVE = [
  'straight',
  'ugly',
  'problematic',
  'a cursed user',
  'from texas',
  'from england',
  'from australia',
  'into feet',
  'too gay to function',
  'addicted to pleads',
  'a nerd',
  'a slut',
  'a clown',
  'a weeb',
  'a boomer',
  'a homestuck',
  'a gremlin',
  'a gamer',
  'a memer',
  'an owen',
  'an edgelord',
  'a wallflower',
  'a backstabber',
  'a hikikomori',
  'an SAO stan',
  'a Mineta stan',
  'a PC boomer',
  'uncomf',
  'feral',
  'lewd',
  'insecure af',
  'a member of gumbo gang',
  'high on potenuse',
  'mewthree w/ armor',
  'quite conservative',
  'quite problematic',
  'mean to porygon',
  'long overdue for cancellation',
  'on their ninth day without sleep',
  "drowning in Crasher Wake's pool",
  'someone who thinks Terraria is better than Minecraft >:(',
  'a player of the expanded free trial of our critically acclaimed MMORPG #FFXIV? you can play through the entirety of a realm reborn and the award-winning heavensward expansion up to level 60 for FREE with no restrictions on playtime',
];

const POSITIVE = [
  'being gay',
  'being stannable',
  'being the big gay',
  'being a hottie',
  'being a slut for heapdats',
  'being friends with everyone',
  'being sent to horny jail',
  'not being british',
  'using /vibe',
  'getting shoved in a locker',
  'being illegally cute',
  'being too cute for #burd-selfies',
  'observing Inky Appreciation Hour',
  'joining the Warrior Cats Club',
  'looking straight at Endermen',
  'being numerous bees',
  'vaping florida to create a hurricane',
  "being the world's biggest yorkshire pudding",
  'having a severe caffeine addiction',
  'feeding the ducks',
  'being comf',
  'vibing',
  "being Doctor Lala's assistant",
  'stanning Dakota',
  'stanning Angie',
  'stanning Inky',
  'stanning Haley',
  'stanning Chura',
  'stanning Mag',
  'stanning Mylah',
];
