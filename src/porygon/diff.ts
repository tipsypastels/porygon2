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

  constructor(object: T, presenter: DiffPresenter<T> = defaultPresenter) {
    this.object = Diff.convert(object);
    this.presenter = presenter;
  }

  get<K extends keyof T>(key: K): DiffValue<T[K]> {
    return this.object[key];
  }

  getChangeString(key: keyof T) {
    return this.presenter(this, key);
  }

  change<K extends keyof T>(key: K, from: T[K], to: T[K]) {
    this.object[key] = { changed: true, data: { from, to } };
  }

  hasChanged(key: keyof T) {
    return this.object[key].changed;
  }
}

function defaultPresenter<T>(diff: Diff<T>, key: keyof T) {
  const value = diff.get(key);

  if (value.changed) {
    return `${value.data.to} (was ${value.data.from})`;
  }

  return `${value.data}`;
}
