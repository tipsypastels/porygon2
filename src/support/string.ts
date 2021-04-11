/** Output format: `Capitalized`. */
export function capitalize(input: string): string {
  return input[0].toUpperCase() + input.slice(1).toLowerCase();
}

/** Output  format `camelCase`. */
export function camelCase(input: string): string {
  return toWords(input).replace(/\s./g, (match) => {
    return match[match.length - 1].toUpperCase();
  });
}

/** Output format: `UpperCamelCase`. */
export function upperCamelCase(input: string): string {
  return input[0].toUpperCase() + camelCase(input.slice(1));
}

/** Output format: `under_score`. */
export function underScore(input: string): string {
  return toWords(input).replace(/\s/g, '_').toLowerCase();
}

/** Output format: `kebab-case`. */
export function kebabCase(input: string): string {
  return toWords(input).replace(/\s/g, '-').toLowerCase();
}

/** Output format: `regular words`. */
export function toWords(input: string): string {
  return input.replace(/[\s-_A-Z]/g, (match) => {
    if (/^[A-Z]$/.exec(match)) {
      return ` ${match.toLowerCase()}`;
    } else {
      return ' ';
    }
  });
}

const WORDS = /(\w+)/i;

/** Yields each word to the iterator. Ignores non-word characters. */
export function* eachWord(input: string) {
  const tokens = input.split(WORDS);

  for (let i = 1; i < tokens.length; i += 2) {
    yield tokens[i];
  }
}
