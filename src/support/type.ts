type X = {
  a: number;
  b: {
    c: number;
    d: number;
    e: {
      f: bigint;
    };
  };
};

type AnyObject = Record<string, unknown>;

type FlattenPaths<T> = T extends AnyObject ? FlattenObject<T> : T;

type FlattenObject<T extends AnyObject> = {
  [K in keyof T as FlattenKey<T, K>]: T[K] extends AnyObject
    ? FlattenPaths<T[K][keyof T[K]]>
    : FlattenPaths<T[K]>;
};

type FlattenKey<T, K extends keyof T> = T[K] extends AnyObject
  ? `${string & K}.${string & keyof T[K]}`
  : K;

type x = FlattenPaths<X>;

type a = x['b.e'];
