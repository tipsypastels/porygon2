import settings from './settings/settings.json';
import get from 'lodash.get';
import set from 'lodash.set';
import has from 'lodash.has';
import { writeFileSync } from 'fs';
import { EnvUnwrapped, unwrapEnv } from 'support/dev';
import { Path, PathValue } from 'support/type/path';

type Settings = typeof settings;
type Value<P extends Path<Settings>> = EnvUnwrapped<PathValue<Settings, P>>;

export function setting<P extends Path<Settings>>(path: P) {
  return {
    get value() {
      return unwrapEnv(get(settings, path)) as Value<P>;
    },
  };
}

// not worth type checking this as it's only ever called via /eval currently
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
