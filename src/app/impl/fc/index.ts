import { FriendCode } from '@prisma/client';

export * from './handle';
export * from './clear';
export * from './get';
export * from './set';

/**
 * The minimal subset of friend code data that most fc functions deal with.
 *
 * We omit user ID because we're only ever looking up a specific user in advance,
 * and because it's easier to test without it.
 */
export type Entry = Pick<FriendCode, 'code' | 'type'>;
