/**
 * Fetches a random item from an array. If some alternate
 * randomness algorithm is desired it can be provided as the
 * second argument.
 */
export function random<T>(array: T[], rand = Math.random): T {
  return array[Math.floor(rand() * array.length)];
}

/**
 * Same as `random`, but returns an array of `count` options.
 */
export function samples<T>(count: number, array: T[], rand = Math.random): T[] {
  return range(0, count, { isExclusive: true }).map(() => random(array, rand));
}

/**
 * Creates an array with all intermediate values.
 */
export function range(
  start: number,
  end: number,
  { isExclusive = false } = {},
) {
  const range: number[] = [];

  for (let i = start; isExclusive ? i < end : i <= end; i++) {
    range.push(i);
  }

  return range;
}

/** Returns the first item of an array. */
export const first = <T>(array: T[]) => array[0];

/** Returns the last item of an array. */
export const last = <T>(array: T[]) => array[array.length - 1];

type ToSentenceOpts<T> = Partial<{
  twoWordConnector: string;
  finalWordConnector: string;
  convert(elem: T): string;
}>;

/**
 * Joins an array into an english sentence.
 */
export function toSentence<T>(
  array: T[],
  {
    twoWordConnector = ', ',
    finalWordConnector = ', and ',
    convert = (elem: T) => `${elem}`,
  }: ToSentenceOpts<T> = {},
): string {
  switch (array.length) {
    case 0:
      return '';
    case 1:
      return convert(array[0]);
    case 2: {
      return `${convert(array[0])}${twoWordConnector}${convert(array[1])}`;
    }
    default: {
      const tail = convert(last(array));
      const main = array.slice(0, -1).map(convert).join(twoWordConnector);
      return `${main}${finalWordConnector}${tail}`;
    }
  }
}
