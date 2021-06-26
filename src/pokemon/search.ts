import { findBestMatch } from 'string-similarity';
import { normalizeName } from './normalize';
import { get } from './cache';
import type { Kind } from './kind';
import type { Base } from './models';

import nameMap from './data/name_map.json';

const ALL_LOWERCASED_NAMES = Object.keys(nameMap);

/**
 * Searches for a Pokemon using its name.
 */
export async function search<T extends Base<any>>(name: string) {
  name = normalizeName(name);

  if (!(name in nameMap)) {
    return undefined;
  }

  const { kind, id } = nameMapGetUnchecked(name);
  const entry = await get(kind, id);

  return entry as T | undefined;
}

type ResultOrSuggestion<T extends Base<any>> =
  | { found: true; result: T }
  | { found: false; didYouMean?: string };

/**
 * Searches for a Pokemon using its name. Returns a discriminated union
 * where the found case contains the resulting data, and the missing case
 * returns a did-you-mean suggestion, if one could be found.
 */
export async function searchOrSuggest<T extends Base<any>>(
  name: string,
): Promise<ResultOrSuggestion<T>> {
  name = normalizeName(name);

  const result = await search<T>(name);

  if (result) {
    return { found: true, result };
  }

  const dym = findBestMatch(name, ALL_LOWERCASED_NAMES);

  if (dym.bestMatch.rating > 0.7) {
    const { kind, id } = nameMapGetUnchecked(dym.bestMatch.target);
    const suggestedEntry = await get(kind, id);

    return { found: false, didYouMean: suggestedEntry!.name };
  }

  return { found: false };
}

function nameMapGetUnchecked(key: string) {
  return nameMap[key as keyof typeof nameMap] as { kind: Kind; id: string };
}
