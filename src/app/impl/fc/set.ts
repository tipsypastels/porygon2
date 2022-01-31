import { FriendCodeType } from '@prisma/client';
import { Maybe } from 'support/null';
import { FcEntry } from '.';
import { FcHandle } from './handle';
import { try_tidy_fc } from './tidy';

type Changes = { code: Maybe<string>; type: FriendCodeType }[];
type Changed = FcEntry[];

type Result =
  | { ok: false; error: 'no_op' }
  | { ok: false; error: 'untidy'; untidy_code: string; type: FriendCodeType }
  | { ok: true; changed: Changed };

/**
 * Applies the provided changes to the user described by the handle.
 */
export async function fc_set(handle: FcHandle, changes: Changes): Promise<Result> {
  const changed: Changed = [];

  for (const { code: untidy_code, type } of changes) {
    if (!untidy_code) {
      continue;
    }

    const code = try_tidy_fc(untidy_code);

    if (!code) {
      return { ok: false, error: 'untidy', untidy_code, type };
    }

    changed.push({ type, code });
    await handle.set(type, code);
  }

  if (changed.length === 0) {
    return { ok: false, error: 'no_op' };
  }

  return { ok: true, changed };
}
