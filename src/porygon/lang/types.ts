import { Empty } from 'support/object';
import { Path, PathValue } from 'support/path';
import { Stringable } from 'support/string';

type PluralMap = {
  [key: number]: string;
  _: string;
};

/** @internal */
export type Phrase = string | PluralMap;

export interface Lang {
  [key: string]: Lang | Phrase;
}

type WithCount<S, T> = S extends PluralMap ? T & { count: number } : T;
type ToObject<T extends string> = { [K in T]: Stringable };

type ExtractString<S> = S extends `${string}{${infer Param}}${infer Rest}`
  ? Param | ExtractString<Rest>
  : never;

type ExtractObject<S> = ExtractString<S[keyof S]>;
type Extract<S> = S extends PluralMap ? ExtractObject<S> : ExtractString<S>;

type Params<S> = WithCount<S, ToObject<Extract<S>>>;

/** @internal */
export type LangFn<L extends Lang> = <P extends Path<L>>(
  ...args: LangFnArgs<L, P, Params<PathValue<L, P>>>
) => string;

type LangFnArgs<
  L extends Lang,
  P extends Path<L>,
  V extends Params<PathValue<L, P>>,
> = Empty extends V ? [path: P] : [path: P, params: V];
