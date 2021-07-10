import { Embed } from 'porygon/embed';
import { CommandFn, LocalCommand } from 'porygon/interaction';
import seedRandom from 'seedrandom';
import { random } from 'support/array';

const thanos: CommandFn = async ({ embed, author }) => {
  const rng = seedRandom(author.id);
  const result = random(RESULTS, rng);
  await embed.poryThumb('thanos').merge(result).reply();
};

export default new LocalCommand(thanos, {
  description: 'Rolls the dice on your fate.',
});

const RESULTS = [
  (e: Embed) => {
    e.okColor()
      .setTitle('You were spared by Thanos.')
      .setDescription(
        'The universe is now perfectly balanced, as all things should be.',
      );
  },
  (e: Embed) => {
    e.dangerColor()
      .setTitle("Miss Pory... I don't feel so good, you say...")
      .setDescription(
        'You were slain by Thanos, for the good of the Universe.',
      );
  },
];
