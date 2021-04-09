/**
 * Fetches a random item from an array. If some alternate
 * randomness algorithm is desired it can be provided as the
 * second argument.
 */
export function random<T>(array: T[], rand = Math.random): T {
  return array[Math.floor(rand() * array.length)];
}
