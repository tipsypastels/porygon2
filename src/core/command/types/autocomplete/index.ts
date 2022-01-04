/**
 * @file
 * Autocomplete is *technically* a command type according to Discord.js,
 * but doesn't really work like one. So for convenience it gets its own handlers
 * and types since the regular command ones are overboard.
 */

import { into_options, Options } from 'core/command/options';
import { AutocompleteInteraction as Intr } from 'discord.js';
import { is_string } from 'support/string';

export { add_autocomplete } from './map';

type Suggestion = string | { name: string; value: string };

export interface AutocompleteArgs {
  input: string | number;
  opts: Options<'msg'>;
}

export interface Autocomplete {
  (args: AutocompleteArgs): Promise<Suggestion[]>;
}

export async function execute_autocomplete(intr: Intr, autocomplete: Autocomplete) {
  const opts = into_options<'msg'>(intr.options);
  const input = opts.focus_input();
  const args: AutocompleteArgs = { input, opts };
  const suggestions = (await autocomplete(args)).map(normalize);

  return intr.respond(suggestions);
}

function normalize(suggestion: Suggestion) {
  if (is_string(suggestion)) return { name: suggestion, value: suggestion };
  return suggestion;
}
