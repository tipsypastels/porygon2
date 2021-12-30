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

import { panic_assert } from 'core/assert';
import { AnyCommand } from 'core/command';
import { panic } from 'core/logger';
import { Autocomplete } from '.';
import { ChatCommand } from '../chat';

type Autocompletes = Map<string, Autocomplete>;
type AutocompleteTable = Map<AnyCommand, Autocompletes>;

const MAP: AutocompleteTable = new Map();

export function add_autocomplete(command: ChatCommand, autocomplete: Autocomplete) {
  panic_assert(autocomplete.name, 'Autocomplete functions may not be anonymous');

  const list = MAP.get(command) ?? new Map();

  if (list.has(autocomplete.name)) {
    // i know command.name may not be accurate since it's just the function name,
    // but it's the best we got here without passing more data
    panic(`Autocomplete %${autocomplete.name}% was added twice to %${command.name}%.`);
  }

  list.set(autocomplete.name, autocomplete);
  MAP.set(command, list);
}

/** @internal */
export function fetch_autocomplete(command: AnyCommand, opt: string) {
  return MAP.get(command)?.get(opt);
}
