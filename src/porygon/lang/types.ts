import { Empty } from 'support/type';
import { Path, PathValue } from 'support/type/path';

type Multiple = {
  [key: number]: string;
  _: string;
};

/** @internal */
export type Phrase = string | Multiple;

export interface Lang {
  [key: string]: Lang | Phrase;
}

type Stringable = string | { toString(): string };
type WithCount<S, T> = S extends Multiple ? T & { count: number } : T;
type ToObject<T extends string> = { [K in T]: Stringable };

type ExtractString<S> = S extends `${string}{${infer Param}}${infer Rest}`
  ? Param | ExtractString<Rest>
  : never;

type ExtractObject<S> = ExtractString<S[keyof S]>;
type Extract<S> = S extends Multiple ? ExtractObject<S> : ExtractString<S>;

/** @internal */
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
