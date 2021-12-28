import { Ary } from 'support/type';

interface Task<A extends Ary, R> {
  (...args: A): R | Promise<R>;
}
