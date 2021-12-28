import { Ary, Maybe } from 'support/type';

/**
 * A task-compatible function - basically any function whose first
 * parameter is an optional `TaskHandle`. The handle will always be
 * provided when the task is run via the scheduler, but is nilable
 * so that the function may also be called manually.
 */
interface Task<A extends Ary, R> {
  (handle: Maybe<TaskHandle>, ...args: A): R | Promise<R>;
}

/**
 * A bundle of data and functions provided to tasks.
 */
interface TaskHandle {}
