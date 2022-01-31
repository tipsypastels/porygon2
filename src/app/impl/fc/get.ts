import { FriendCodeType } from '@prisma/client';
import { FcHandle } from './handle';

interface ExcludeOpts {
  exclude_types?: FriendCodeType[];
}

/**
 * Gets a friend code for the user described by the handle.
 *
 * Yeah, I think this is silly too.
 *
 * That's testing for ya.
 */
export function fc_get(handle: FcHandle, opts?: ExcludeOpts) {
  return handle.get(opts);
}
