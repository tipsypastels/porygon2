import { humanizeValue } from 'support/format';

type DiffUnchangedValue<V> = { changed: false; data: V };
type DiffChangedValue<V> = { changed: true; data: { from: V; to: V } };
type DiffValue<V> = DiffUnchangedValue<V> | DiffChangedValue<V>;

type DiffChanges<T> = {
  [K in keyof T]: DiffValue<T[K]>;
};

type DiffPresenter<T> = (diff: Diff<T>, key: keyof T) => string;

export class Diff<T> {
  static convert<T>(object: T) {
    const out: Partial<DiffChanges<T>> = {};
    let key: keyof T;

    for (key in object) {
      out[key] = { changed: false, data: object[key] };
    }

    return out as DiffChanges<T>;
  }

  private object: DiffChanges<T>;
  private presenter: DiffPresenter<T>;
  private _unchanged = true;

  constructor(object: T, presenter: DiffPresenter<T> = defaultPresenter) {
    this.object = Diff.convert(object);
    this.presenter = presenter;
  }

  get unchanged() {
    return this._unchanged;
  }

  get<K extends keyof T>(key: K): DiffValue<T[K]> {
    return this.object[key];
  }

  getCurrentState() {
    const out: Partial<T> = {};
    let key: keyof T;

    for (key in this.object) {
      const value = this.get(key);

      if (value.changed) {
        out[key] = value.data.to;
      } else {
        out[key] = value.data;
      }
    }

    return out as T;
  }

  getChangeString(key: keyof T) {
    return this.presenter(this, key);
  }

  change<K extends keyof T>(key: K, value: T[K]) {
    this._unchanged = false;
    this.object[key] = {
      changed: true,
      data: this.nextDataValue(key, value),
    };
  }

  changeMany(changes: Partial<T>) {
    let key: keyof T;

    for (key in changes) {
      this.change(key, changes[key]!);
    }
  }

  hasChanged(key: keyof T) {
    return this.object[key].changed;
  }

  private nextDataValue<K extends keyof T>(key: K, to: T[K]) {
    console.log(key);
    console.log(this.object);

    const value = this.get(key);

    if (value.changed) {
      return { from: value.data.from, to };
    }

    return { from: value.data, to };
  }
}

function defaultPresenter<T>(diff: Diff<T>, key: keyof T) {
  const value = diff.get(key);

  if (value.changed) {
    return `${humanizeValue(value.data.to)} (formerly: ${humanizeValue(
      value.data.from,
    )})`;
  }

  return humanizeValue(value.data);
}
