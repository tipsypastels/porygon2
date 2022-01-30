/**
 * @file
 * Autocomplete is *technically* a command type according to Discord.js,
 * but doesn't really work like one. So for convenience it gets its own handlers
 * and types since the regular command ones are overboard.
 */

import { Cell } from 'core/command';
import { into_options, Options } from 'core/command/options';
import { logger } from 'core/logger';
import { AutocompleteInteraction as Intr } from 'discord.js';
import { is_string } from 'support/string';
import { fetch_autocomplete } from './map';

export { add_autocomplete } from './map';

type Suggestion = string | { name: string; value: string };

export interface AutocompleteArgs {
  input: string | number;
  opts: Options<'msg'>;
}

export interface Autocomplete {
  (args: AutocompleteArgs): Promise<Suggestion[]>;
}

export async function execute_autocomplete(intr: Intr, cell: Cell) {
  function target() {
    const name = intr.options.getSubcommand(false);
    if (!name) return cell.command;

    const subcommand = cell.command.__sub_commands?.[name];
    if (subcommand) return subcommand;

    logger.warn(`Unknown subcommand %${name}% for %${cell.name}%`);
  }

  const command = target();
  if (!command) return;

  const { name } = intr.options.getFocused(true);
  const autocomplete = fetch_autocomplete(command, name);

  if (!autocomplete) {
    logger.warn(`Unknown autocomplete for %${cell.name}% option %${name}%`);
    return;
  }

  return await do_autocomplete(intr, autocomplete);
}

async function do_autocomplete(intr: Intr, autocomplete: Autocomplete) {
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
