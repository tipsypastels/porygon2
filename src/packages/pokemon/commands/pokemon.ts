import { Command } from 'porygon/interaction';
import { searchOrSuggest } from 'pokemon';
import { codeBlock } from 'support/format';
import { inspect } from 'util';

interface Opts {
  query: string;
}

const pokemon: Command.Fn<Opts> = async ({ embed, opts }) => {
  const result = await searchOrSuggest(opts.query);

  if (result.found) {
    const tempPreview = codeBlock(inspect(result.result, { depth: null }));
    embed.setDescription(tempPreview);
  } else {
    embed
      .setTitle('Not Found')
      .if(result.didYouMean, (d) => embed.setDescription(`Did you mean ${d}?`));
  }

  await embed.reply();
};

export default new Command(pokemon, {
  description: 'Looks up Pokémon information.',
  options: [
    {
      name: 'query',
      type: 'STRING',
      description: 'What to search for.',
      required: true,
    },
  ],
});
