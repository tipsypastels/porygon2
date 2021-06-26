/**
 * Turns a user-provided name into an ID-like lowercase name. This isn't quite
 * the same as an ID, as lowercase names can still have spaces and special
 * characters, it's simply a way to match against user input in an
 * unambiguous format.
 *
 * This also fixes a number of typos with Pokemon whose names could be
 * written multiple ways, such as Mr. Mime.
 */
export function normalizeName(name: string) {
  return fixCommonTypos(name.toLowerCase());
}

/**
 * NOTE: Because this is used in search, we can't know what the kind is
 * at this point and have to run all replacements for all kinds. This probably
 * won't be a problem.
 */
function fixCommonTypos(name: string) {
  return name
    .replace(/^flabebe$/, 'flabébé')
    .replace(/^type ?null$/, 'type: null')
    .replace(/^ho ?oh$/, 'ho-oh')
    .replace(/^mr ?mime$/, 'mr. mime')
    .replace(/^mime ?jr$/, 'mime jr.')
    .replace(/^jangmo ?o$/, 'jangmo-o')
    .replace(/^hakamo ?o$/, 'hakamo-o')
    .replace(/^kommo ?o$/, 'kommo-o');
}
