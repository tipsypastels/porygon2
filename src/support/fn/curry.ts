// From https://gist.github.com/webstrand/0408309b35ef1d585c1f79bf79e0caab.

/**
 * Get the union of all prefixes of some tuple. Finite, optional, and variadic tuples are
 * all supported. Labels are only preserved for finite tuples without optional members.
 */
type Prefixes<T extends readonly unknown[]> = T extends { length: infer X } & {
  length: infer Y;
}
  ? (X extends unknown ? (Y extends X ? 0 : 1) : never) extends 0
    ? number extends T['length'] // If the tuple is variadic
      ? PrefixesNoLabels<T> // we bail out and use the variadic supporting type
      : PrefixesFinite<T>
    : PrefixesNoLabels<T> // otherwise we bail out and use the optional member supporting type
  : never;

/** @private
 * Get the union of all prefixes of some tuple. Only finite tuples are supported.
 */
type PrefixesFinite<T extends readonly unknown[]> = T extends readonly [...infer U, any] // Remove one element at a time
  ?
      | [...T] // wrapped to erase any readonly attributes
      | PrefixesFinite<U>
  : never;

/** @private
 * Get the union of all prefixes of some tuple. Finite and variadic tuples are
 * both supported. But labels are never preserved.
 */
type PrefixesNoLabels<
  T extends readonly unknown[],
  Acc extends readonly unknown[] = [T extends [infer U, ...any] ? U : never],
> = T extends readonly [...Acc, infer U, ...any]
  ? Acc | PrefixesNoLabels<T, [...Acc, U]>
  : T;

type UnionToIntersection<U> = (U extends U ? (x: U) => 0 : never) extends (
  x: infer I,
) => 0
  ? I
  : never;

type Curried<P extends readonly unknown[], R> = P extends readonly []
  ? (...args: P) => R
  : Curried_<P, R>;
type Curried_<P extends readonly unknown[], R> = P extends readonly []
  ? R
  : Curried__<P, R, Prefixes<P>>;
type Curried__<
  P extends readonly unknown[],
  R,
  V extends readonly unknown[],
> = UnionToIntersection<
  V extends V
    ? (...args: V) => Curried_<P extends readonly [...V, ...infer Q] ? Q : never, R>
    : never
>;

type NonUnion<T, Ret = T, U extends T = T> = (
  T extends unknown ? (U extends T ? 0 : 1) : never
) extends 0
  ? Ret
  : never;

type CountRequired<
  T extends readonly unknown[],
  Front extends readonly unknown[] = [],
> = [] extends T // optional remaining
  ? Front['length']
  : T extends readonly [infer Head, ...infer Tail]
  ? CountRequired<Tail, [...Front, Head]>
  : never;
// This overload is complex because it's trying to confirm that the passed function doesn't
// have any optional arguments. If the function _does_ have optional arguments we force the
// user to pass in an explicit number of non-optional arguments at runtime. We have to do
// this due to the fact that javascript counts optional arguments in fn.length and typescript
// does not. To avoid hairy runtime errors where the user expects to have called a function
// according to the types, we make sure runtime knows how many arguments to expect.
export function curry<P extends readonly unknown[], R>(
  fn: [P] extends [never] ? (...args: P) => R : NonUnion<P['length'], (...args: P) => R>,
): 0 extends 1 & P ? never : Curried<P, R>;
export function curry<P extends readonly unknown[], R>(
  fn: (...args: P) => R,
  len: CountRequired<P>,
): 0 extends 1 & P ? never : Curried<P, R>;
export function curry<R>(fn: (...args: any) => R, len: number = fn.length) {
  const stash: any[] = [];
  const curry = (...args: any): ((...args: any) => any) | R => {
    if (stash.length + args.length >= len) {
      return fn(...stash, ...args);
    }
    stash.push(...args);
    return curry;
  };
  return curry;
}
