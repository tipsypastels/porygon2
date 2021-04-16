import settings from './settings/settings.json';
import get from 'lodash.get';
import set from 'lodash.set';
import has from 'lodash.has';
import { writeFileSync } from 'fs';
import { unwrapEnv } from 'support/dev';

export function setting<T = unknown>(key: string) {
  assertSettingExists(key);

  return {
    get value() {
      return unwrapEnv(get(settings, key)) as T;
    },
  };
}

export function setSetting(key: string, value: any) {
  assertSettingExists(key);
  set(settings, key, value);
  overwriteSettingsFile();
}

function assertSettingExists(key: string) {
  if (!has(settings, key)) {
    throw new Error(`No such setting: ${key}`);
  }
}

function overwriteSettingsFile() {
  const file = `${__dirname}/settings/settings.json`;
  const json = JSON.stringify(settings, null, 2);

  writeFileSync(file, json);
}
