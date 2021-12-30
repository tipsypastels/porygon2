/**
 * @file
 * Stores all the autocompletes.
 *
 * This would be a registrar (and started as one) but it's
 *
 *  - not scoped to anything (commands are unique keys on their own)
 *  - got nothing to synchronize
 *
 * so we just use a regular global map.
 */

import { AnyCommand } from 'core/command';
import { panic } from 'core/logger';
import { Autocomplete } from '.';
import { ChatCommand } from '../chat';

type Autocompletes = Map<string, Autocomplete>;
type AutocompleteTable = Map<AnyCommand, Autocompletes>;

const MAP: AutocompleteTable = new Map();

export function add_autocomplete(
  command: ChatCommand,
  opt: string,
  autocomplete: Autocomplete,
) {
  const list = MAP.get(command) ?? new Map();

  if (list.has(opt)) {
    // i know command.name may not be accurate since it's just the function name,
    // but it's the best we got here without passing more data
    panic(`Autocomplete %${opt}% was added twice to %${command.name}%.`);
  }

  list.set(opt, autocomplete);
  MAP.set(command, list);
}

/** @internal */
export function fetch_autocomplete(command: AnyCommand, opt: string) {
  return MAP.get(command)?.get(opt);
}
