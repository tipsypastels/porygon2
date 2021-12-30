/**
 * @file
 *
 * Utilities for building PokéCommunity URLs, for use in error messages,
 * FAQ entries, or similar.
 */

const BASE = 'https://pokecommunity.com';

export function thread(id: number) {
  return `${BASE}/showthread.php?t=${id}`;
}

export function forum(slug: string) {
  return `${BASE}/forumdisplay.php?fn=${slug}`;
}

export function forum_prefix(slug: string, prefix: string) {
  return `${forum(slug)}&prefixid=${prefix}`;
}

export function about(page: string) {
  return `${BASE}/about.php?do=${page}`;
}
