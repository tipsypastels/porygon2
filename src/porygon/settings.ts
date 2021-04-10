import { EnvWrapper, unwrapEnv } from 'support/dev';
import { database } from './database';

const table = database.settings;

export function setting<T>(key: string, initial: EnvWrapper<T>) {
  const initialValue = unwrapEnv(initial);

  return async function getSettingOrInitial(): Promise<T> {
    const result = await getSetting<T>(key);

    if (result != null) {
      return result;
    }

    await table.create({
      data: { key, value: JSON.stringify(initialValue) },
    });

    return initialValue;
  };
}

export async function getSetting<T>(key: string) {
  const entry = await table.findFirst({ where: { key } });

  if (entry) {
    return JSON.parse(entry.value) as T;
  }
}
