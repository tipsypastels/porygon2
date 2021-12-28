/** Returns the first item of an array. */
export const first = <T>(array: T[]) => array[0];

/** Returns the last item of an array. */
export const last = <T>(array: T[]) => array[array.length - 1];

/**
 * Returns a random element of an array.
 */
export function random<T>(array: T[], rng = Math.random): T {
  return array[Math.floor(rng() * array.length)];
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
