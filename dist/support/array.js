"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toSentence = exports.last = exports.first = exports.range = exports.samples = exports.random = void 0;
/**
 * Fetches a random item from an array. If some alternate
 * randomness algorithm is desired it can be provided as the
 * second argument.
 */
function random(array, rand = Math.random) {
    return array[Math.floor(rand() * array.length)];
}
exports.random = random;
/**
 * Same as `random`, but returns an array of `count` options.
 */
function samples(count, array, rand = Math.random) {
    return range(0, count, { isExclusive: true }).map(() => random(array, rand));
}
exports.samples = samples;
/**
 * Creates an array with all intermediate values.
 */
function range(start, end, { isExclusive = false } = {}) {
    const range = [];
    for (let i = start; isExclusive ? i < end : i <= end; i++) {
        range.push(i);
    }
    return range;
}
exports.range = range;
/** Returns the first item of an array. */
const first = (array) => array[0];
exports.first = first;
/** Returns the last item of an array. */
const last = (array) => array[array.length - 1];
exports.last = last;
/**
 * Joins an array into an english sentence.
 */
function toSentence(array, { twoWordConnector = ', ', finalWordConnector = ', and ', convert = (elem) => `${elem}`, } = {}) {
    switch (array.length) {
        case 0:
            return '';
        case 1:
            return convert(array[0]);
        case 2: {
            return `${convert(array[0])}${twoWordConnector}${convert(array[1])}`;
        }
        default: {
            const tail = convert(exports.last(array));
            const main = array.slice(0, -1).map(convert).join(twoWordConnector);
            return `${main}${finalWordConnector}${tail}`;
        }
    }
}
exports.toSentence = toSentence;
