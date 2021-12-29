/**
 * @file
 * Autocomplete is *technically* a command type according to Discord.js,
 * but doesn't really work like one. So for convenience it gets its own handlers
 * and types since the regular command ones are overboard.
 */

import { AutocompleteInteraction as Intr } from 'discord.js';
import { is_string } from 'support/string';

type Suggestion = string | { name: string; value: string };

export interface AutocompleteArgs {
  input: string | number;
}

export interface Autocomplete {
  (args: AutocompleteArgs): Suggestion[];
}

export function execute_autocomplete(intr: Intr, autocomplete: Autocomplete) {
  const input = intr.options.getFocused();
  const args: AutocompleteArgs = { input };
  const suggestions = autocomplete(args).map(normalize);

  return intr.respond(suggestions);
}

function normalize(suggestion: Suggestion) {
  if (is_string(suggestion)) return { name: suggestion, value: suggestion };
  return suggestion;
}
