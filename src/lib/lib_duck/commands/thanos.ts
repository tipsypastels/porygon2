import { Command } from 'interaction/command';
import { PorygonEmbed } from 'porygon/embed';
import seedRandom from 'seedrandom';
import { random } from 'support/array';

const thanos: Command = async ({ embed, member }) => {
  const rng = seedRandom(member.id);
  const result = random(RESULTS, rng);
  await embed.poryThumb('thanos').merge(result).reply();
};

thanos.description = 'Rolls the dice on your fate.';

export default thanos;

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
