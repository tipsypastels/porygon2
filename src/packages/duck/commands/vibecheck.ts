import { GuildMember } from 'discord.js';
import { CommandFn, LocalCommand } from 'porygon/interaction';
import { setting } from 'porygon/settings';
import { random } from 'support/array';
import { bold } from 'support/format';

interface Opts {
  member?: GuildMember;
}

const vibecheck: CommandFn<Opts> = async ({ embed, opts, author }) => {
  const member = opts.member ?? author;
  const name = member.displayName;

  const pos = trait(POSITIVE_TRAITS);
  const neg = trait(NEGATIVE_TRAITS);

  await embed
    .infoColor()
    .setAuthor('✨ 𝓋𝒾𝒷𝑒 𝒸𝒽𝑒𝒸𝓀 ✨')
    .setTitle(`${name}'s vibe`)
    .setDescription(`${name} is ${neg} but makes up for it by ${pos}.`)
    .reply();
};

export default new LocalCommand(vibecheck, {
  description: "Checks your vibes (or someone else's)",
  options: [
    {
      name: 'member',
      description: 'Member whose vibes to check. Defaults to you if not set.',
      type: 'USER',
      required: false,
    },
  ],
});

const POSITIVE_TRAITS = setting('pkg.duck.vibecheck.positive_traits');
const NEGATIVE_TRAITS = setting('pkg.duck.vibecheck.negative_traits');

type TraitList = typeof POSITIVE_TRAITS;

function trait(list: TraitList) {
  return bold(random(list.value));
}
