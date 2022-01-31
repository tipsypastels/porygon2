import { FriendCodeType } from '@prisma/client';
import { $db } from 'core/db';
import { FcEntry } from '.';

const TABLE = $db.friendCode;

interface GetOpts {
  exclude_types?: FriendCodeType[];
}

interface OptionalType {
  type?: FriendCodeType;
}

/**
 * A manager for friend code commands, which encapsulates all the
 * database related logic. This is extracted into its own type so
 * that it can be mocked for testing purposes.
 */
export interface FcHandle {
  /**
   * Gets all friend code entries for a user.
   *
   * You can exclude specific types of friend codes, which is used in the
   * /fc set implementation to only query types that weren't explicitly
   * just set by the user.
   */
  get(opts?: GetOpts): Promise<FcEntry[]>;

  /**
   * Sets the a specific type to a given code for the user.
   */
  set(type: FriendCodeType, code: string): Promise<void>;

  /**
   * Checks if the user has any friend codes. Alternatively, a specific
   * type can be checked for using the provided option.
   */
  has(opts?: OptionalType): Promise<boolean>;

  /**
   * Clears all friend codes. Alternatively, only a specific type
   * can be cleared using the provided options.
   */
  clear(opts?: OptionalType): Promise<void>;
}

/**
 * Creates an FC handle for a given user, which wraps database-related
 * tasks for that user.
 *
 * @see FcHandle
 */
export function create_fc_handle(user_id: string): FcHandle {
  return {
    get({ exclude_types = [] } = {}) {
      return TABLE.findMany({
        where: { user_id, type: { notIn: exclude_types } },
        orderBy: { type: 'asc' },
      });
    },

    async set(type, code) {
      await TABLE.upsert({
        where: { user_id_type: { user_id, type } },
        create: { user_id, type, code },
        update: { code },
      });
    },

    has({ type } = {}) {
      return TABLE.count({ where: { user_id, type } }).then((c) => c !== 0);
    },

    async clear({ type } = {}) {
      await TABLE.deleteMany({ where: { user_id, type } });
    },
  };
}
