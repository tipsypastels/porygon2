import { Prisma } from '@prisma/client';
import { Collection } from 'discord.js';
import { EnvWrapper, unwrapEnv } from 'support/dev';
import { database } from './database';

type JSON = Prisma.JsonValue;

export class Setting<T extends JSON> {
  private static all = new Collection<string, Setting<any>>();
  private static table = database.settings;

  static async synchronize() {
    const records = await this.table.findMany();
    const promises = this.all.map(async (setting) => {
      console.log(setting);

      const record = records.find((r) => r.key === setting.key);

      if (!record) {
        setting._value = setting.initial;

        return await this.table.create({
          data: { key: setting.key, value: setting.initial },
        });
      }

      setting._value = record.value;
    });

    await Promise.all(promises);
  }

  static get(key: string) {
    return this.all.get(key);
  }

  static value(key: string) {
    return this.get(key)?.value;
  }

  readonly key: string;
  readonly initial: T;

  private _value?: T;

  constructor(key: string, initial: EnvWrapper<T>) {
    this.key = key;
    this.initial = unwrapEnv(initial);

    Setting.all.set(this.key, this);
  }

  get value(): T {
    return this._value ?? this.initial;
  }

  async set(value: T) {
    this._value = value;
    await Setting.table.update({ where: { key: this.key }, data: { value } });
  }
}
