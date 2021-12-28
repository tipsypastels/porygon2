import { Ary } from './any';

export * from './any';
export * from './null';
export * from './unset';

export function is_string(x: unknown): x is string {
  return typeof x === 'string';
}

export type Stringable = string | { toString(): string };

export function is_stringable(x: unknown): x is Stringable {
  return is_string(x) || (x != null && 'toString' in <any>x);
}

export function is_array(x: unknown): x is Ary {
  return Array.isArray(x);
}
