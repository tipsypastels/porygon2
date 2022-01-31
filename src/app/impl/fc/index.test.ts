import { FriendCodeType } from '@prisma/client';
import { FcHandle, fc_get, fc_clear, fc_set, FcEntry } from '.';

function create_entries(...types: FriendCodeType[]): FcEntry[] {
  return types.map((type) => ({ type, code: '1111-2222-3333' }));
}

function create_handle(initial_storage: FcEntry[] = []): FcHandle {
  let storage = initial_storage;

  return {
    async get({ exclude_types = [] } = {}) {
      return storage.filter((e) => !exclude_types.includes(e.type));
    },

    async set(type, code) {
      const existing = storage.find((e) => e.type === type);
      if (existing) {
        existing.code = code;
      } else {
        storage.push({ type, code });
      }
    },

    async has({ type } = {}) {
      if (!type) return storage.length > 0;
      return !!storage.find((e) => e.type === type);
    },

    async clear({ type } = {}) {
      if (!type) {
        storage = [];
        return;
      }

      storage = storage.filter((e) => e.type !== type);
    },
  };
}

describe(fc_get, () => {
  it('gets all entries from storage', async () => {
    const entries = create_entries('GO', 'SWITCH');
    const handle = create_handle(entries);
    const result = await handle.get();

    expect(result).toEqual(entries);
  });

  it('gets all entries from storage, excluding a specific type', async () => {
    const entries = create_entries('GO', 'SWITCH');
    const handle = create_handle(entries);
    const result = await handle.get({ exclude_types: ['GO'] });

    expect(result).toEqual([entries[1]]);
  });

  it('gets all entries from storage, excluding several specific types', async () => {
    const entries = create_entries('GO', 'SWITCH', 'THREEDS');
    const handle = create_handle(entries);
    const result = await handle.get({ exclude_types: ['GO', 'SWITCH'] });

    expect(result).toEqual([entries[2]]);
  });

  it('returns no results for an empty storage', async () => {
    const handle = create_handle();
    const result = await handle.get();

    expect(result).toEqual([]);
  });

  it('returns no results for a full exclude list', async () => {
    const entries = create_entries('GO', 'SWITCH', 'THREEDS');
    const handle = create_handle(entries);
    const result = await handle.get({ exclude_types: ['GO', 'SWITCH', 'THREEDS'] });

    expect(result).toEqual([]);
  });
});

describe(fc_set, () => {
  it('sets a value in storage', async () => {
    const changes = create_entries('SWITCH');
    const handle = create_handle();

    const result = await fc_set(handle, changes);

    expect(result).toEqual({ ok: true, changed: changes });
    expect(await handle.get()).toEqual(changes);
  });

  it('can set multiple values', async () => {
    const changes = create_entries('SWITCH', 'GO');
    const handle = create_handle();

    const result = await fc_set(handle, changes);

    expect(result).toEqual({ ok: true, changed: changes });
    expect(await handle.get()).toEqual(changes);
  });

  it('errors on empty change lists', async () => {
    const changes: never[] = [];
    const handle = create_handle();

    const result = await fc_set(handle, changes);

    expect(result).toEqual({ ok: false, error: 'no_op' });
  });

  // see tidy.test.ts for more tests on the specific tidying rules
  it('errors on untidy codes', async () => {
    const changes: FcEntry[] = [{ type: 'THREEDS', code: 'hello' }];
    const handle = create_handle();

    const result = await fc_set(handle, changes);

    expect(result).toEqual({
      ok: false,
      error: 'untidy',
      untidy_code: 'hello',
      type: 'THREEDS',
    });
  });

  it('references the first untidy code in a list of multiple changes', async () => {
    const ok_changes = create_entries('THREEDS', 'GO');
    const bad_change: FcEntry = { type: 'SWITCH', code: 'bad' };
    const changes = [ok_changes[0], bad_change, ok_changes[1]];
    const handle = create_handle();

    const result = await fc_set(handle, changes);

    expect(result).toEqual({
      ok: false,
      error: 'untidy',
      untidy_code: 'bad',
      type: 'SWITCH',
    });
  });
});

describe(fc_clear, () => {
  it('clears the storage', async () => {
    const entries = create_entries('SWITCH', 'GO', 'THREEDS');
    const handle = create_handle(entries);

    const result = await fc_clear(handle);

    expect(result.ok).toBe(true);
    expect(await handle.get()).toEqual([]);
  });

  it('clears only the specific type if given', async () => {
    const entries = create_entries('SWITCH', 'GO', 'THREEDS');
    const remaining_entries = create_entries('SWITCH', 'GO');
    const handle = create_handle(entries);

    const result = await fc_clear(handle, 'THREEDS');

    expect(result.ok).toBe(true);
    expect(await handle.get()).toEqual(remaining_entries);
  });

  it('errors if attempting to clear an absent type', async () => {
    const entries = create_entries('SWITCH');
    const handle = create_handle(entries);

    const result = await fc_clear(handle, 'GO');

    expect(result).toEqual({ ok: false, error: 'no_op' });
  });

  it('errors if attempting to clear anything fron an empty storage', async () => {
    const handle = create_handle();
    const result = await fc_clear(handle);

    expect(result).toEqual({ ok: false, error: 'no_op' });
  });
});
