import { FriendCodeType } from '@prisma/client';
import { FcHandle } from './handle';

type Result = { ok: false; error: 'no_op' } | { ok: true };

/**
 * Clears the provided friend code (or all friend codes) for the user described
 * by the handle.
 */
export async function fc_clear(handle: FcHandle, type?: FriendCodeType): Promise<Result> {
  const has = await handle.has({ type });
  if (!has) {
    return { ok: false, error: 'no_op' };
  }

  await handle.clear({ type });
  return { ok: true };
}
