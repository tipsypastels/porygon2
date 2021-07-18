import get from 'lodash.get';
import { Lang, LangFn, Phrase } from './types';

type HasCount = { count: number };

/**
 * Creates a very simple lightweight i18n function. This need not be
 * used for all text, since Porygon doesn't really support non-English
 * at all, but it's useful for files with lots of strings and to avoid
 * gross pluralization gymnastics.
 *
 *     const lang = createLang(<const>{ hello: 'Hello!' })
 *     lang('hello') // => Hello!
 *
 * You can pass in any number of (potentially nested) strings and
 * access them in a path-style syntax.
 *
 * Parameters are supported and will be checked at compile time. In
 * order to make this work, the parameter to create lang *must* be
 * declared `<const>`.
 *
 *     const lang = createLang(<const>{ color: 'The color is {color}!' })
 *     lang('color', { color: 'red' }) // => The color is red!
 *
 * You can also pass in an object that represents multiple pluralization
 * states, preventing the need to manually pluralize. For example:
 *
 *     const lang = createLang(<const>{ friend:
 *       1: 'You have 1 new friend request.',
 *       _: 'You have {count} new friend requests.'
 *     });
 *
 *    lang('friend', { count: 1 }) // => You have 1 new friend request.
 *    lang('friend', { count: 2 }) // => You have 2 new friend requests.
 *
 * When using this feature the parameter `count` must always be provided,
 * even if none of the strings actually use it. In addition, you can provide
 * strings for any numbers, not just `1` and `_`, although that'll usually
 * be all that's needed.
 */
export function createLang<L extends Lang>(lang: L): LangFn<L> {
  return function (...args) {
    const path = args[0];
    const params = args[1];

    const phrase = get(lang, path) as Phrase;
    let phraseString = resolvePhraseString(phrase, () => (params as HasCount).count);

    if (params) {
      for (const [key, value] of Object.entries(params)) {
        phraseString = phraseString.replace(`{${key}}`, value as string);
      }
    }

    return phraseString;
  };
}

function resolvePhraseString(phrase: Phrase, getCount: () => number) {
  if (typeof phrase === 'string') {
    return phrase;
  }

  // lazy because strings don't have a .count,
  // so we'd rather not uncritically pass it in
  // (even if it technically wouldn't blow up in pure js)
  const count = getCount();

  if (count in phrase) {
    return phrase[count];
  }

  return phrase._;
}
