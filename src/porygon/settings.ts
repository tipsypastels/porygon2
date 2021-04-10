import { Prisma } from '@prisma/client';
import { EnvWrapper, unwrapEnv } from 'support/dev';
import { database } from './database';

const table = database.settings;

type JSON = Prisma.JsonValue;

export function setting<T extends JSON>(key: string, initial: EnvWrapper<T>) {
  const initialValue = unwrapEnv(initial);

  return async function getSettingOrInitial(): Promise<T> {
    const result = await getSetting<T>(key);

    if (result != null) {
      return result;
    }

    await table.create({
      data: { key, value: initialValue },
    });

    return initialValue;
  };
}

export async function getSetting<T extends JSON>(key: string) {
  const entry = await table.findFirst({ where: { key } });

  if (entry) {
    return entry.value as T;
  }
}

export async function setSetting<T extends JSON>(key: string, value: T) {
  await table.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });
}
