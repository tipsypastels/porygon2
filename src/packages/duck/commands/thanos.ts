import { Command } from 'porygon/interaction';
import { PorygonEmbed } from 'porygon/embed';
import seedRandom from 'seedrandom';
import { random } from 'support/array';

const thanos: Command.Fn = async ({ embed, member }) => {
  const rng = seedRandom(member.id);
  const result = random(RESULTS, rng);
  await embed.poryThumb('thanos').merge(result).reply();
};

export default new Command(thanos, {
  description: 'Rolls the dice on your fate.',
});

const RESULTS = [
  (e: PorygonEmbed) => {
    e.okColor()
      .setTitle('You were spared by Thanos.')
      .setDescription(
        'The universe is now perfectly balanced, as all things should be.',
      );
  },
  (e: PorygonEmbed) => {
    e.dangerColor()
      .setTitle("Miss Pory... I don't feel so good, you say...")
      .setDescription(
        'You were slain by Thanos, for the good of the Universe.',
      );
  },
];
