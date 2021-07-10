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
 * Returns whether the values of `a` and `b` are all equal.
 */
export function areArraysStructurallyEqual<T>(a: T[], b: T[]) {
  if (a === b) {
    return true;
  }

  if (a.length !== b.length) {
    return false;
  }

  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) {
      return false;
    }
  }

  return true;
}

/**
 * Splits `array` into an array of arrays, each of size `size`.
 * The final sub-array may be smaller if the sizes don't match up.
 */
export function chunk<T>(size: number, array: T[]) {
  const out: T[][] = [];

  for (let i = 0; i < array.length; i++) {
    if (i % size === 0) {
      out.push([]);
    }

    out[out.length - 1].push(array[i]);
  }

  return out;
}

/**
 * Calls the callback `count` times. Acts like `Array.prototype.map` if the callback
 * returns a value.
 */
export function times<R>(count: number, callback: (i: number) => R) {
  return range(0, count, { isExclusive: true }).map(callback);
}

/**
 * Like `Array.prototype.map`, but omits falsy values both before and after transforming.
 */
export function filterMap<T, R>(
  array: (T | undefined)[],
  filter: (item: T) => R,
) {
  const out: R[] = [];

  for (const item of array) {
    if (!item) {
      continue;
    }

    const transformed = filter(item);

    if (transformed) {
      out.push(transformed);
    }
  }

  return out;
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
