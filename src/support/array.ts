/* -------------------------------------------------------------------------- */
/*                                    Types                                   */
/* -------------------------------------------------------------------------- */

/**
 * The most general array type.
 */
export type Ary = readonly any[];

/**
 * The most general mutable array type.
 */
export type MutAry = any[];

/**
 * The type of the first item in an array.
 */
export type Head<T extends Ary> = T[0];

/**
 * The type of all elements in an array after the first.
 */
export type Tail<T extends Ary> = T extends [unknown, ...infer R] ? R : never;

/* -------------------------------------------------------------------------- */
/*                             Type Predicates                                */
/* -------------------------------------------------------------------------- */

/**
 * Returns whether or not a mysterious value is an `Array`.
 */
export function is_array(x: unknown): x is Ary {
  return Array.isArray(x);
}

/* -------------------------------------------------------------------------- */
/*                                  Utilities                                 */
/* -------------------------------------------------------------------------- */

/**
 * Wraps a value in an array, if it is not already an array.
 */
export function as_array<T>(t: T | T[]): T[] {
  return is_array(t) ? t : [t];
}

/**
 * Returns the first item of an array.
 */
export const first = <T>(array: T[]) => array[0];

/**
 * Returns the last item of an array.
 */
export const last = <T>(array: T[]) => array[array.length - 1];

/**
 * Returns a random element of an array.
 */
export function random<T>(array: T[], rng = Math.random): T {
  return array[Math.floor(rng() * array.length)];
}

/**
 * Calls the callback with each element of the array.
 */
export function each<T>(fn: (t: T) => void, array: T[]) {
  for (const item of array) {
    fn(item);
  }
}

/**
 * Joins an array into an english sentence.
 */
export function to_sentence<T>(
  array: T[],
  {
    two_word_connector = ' and ',
    word_connector = ', ',
    final_word_connector = ', and ',
    convert = (elem: T) => `${elem}`,
  } = {},
) {
  switch (array.length) {
    case 0: {
      return '';
    }
    case 1: {
      return convert(array[0]);
    }
    case 2: {
      return `${convert(array[0])}${two_word_connector}${convert(array[1])}`;
    }
    default: {
      const end = convert(last(array));
      const main = array.slice(0, -1).map(convert).join(word_connector);
      return `${main}${final_word_connector}${end}`;
    }
  }
}
