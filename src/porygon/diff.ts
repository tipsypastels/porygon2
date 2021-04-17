import { humanizeValue } from 'support/format';

type DiffUnchangedValue<V> = { changed: false; data: V };
type DiffChangedValue<V> = { changed: true; data: { from: V; to: V } };
type DiffValue<V> = DiffUnchangedValue<V> | DiffChangedValue<V>;

type DiffChanges<T> = {
  [K in keyof T]: DiffValue<T[K]>;
};

type DiffPresenter<T> = (diff: Diff<T>, key: keyof T) => string;

type DiffEachUnchanged<T> = (
  value: DiffUnchangedValue<T[keyof T]>,
  key: keyof T,
) => void;

type DiffEachChanged<T> = (
  value: DiffChangedValue<T[keyof T]>,
  key: keyof T,
) => void;

type DiffEach<T> = Partial<{
  eachChanged: DiffEachChanged<T>;
  eachUnchanged: DiffEachUnchanged<T>;
}>;

export enum DiffState {
  Changed,
  Unchanged,
  AllChangesWereNoOps,
}

export class Diff<T> {
  static convert<T>(object: T) {
    const out: Partial<DiffChanges<T>> = {};
    let key: keyof T;

    for (key in object) {
      out[key] = { changed: false, data: object[key] };
    }

    return out as DiffChanges<T>;
  }

  static of<T>(from: T, to: Partial<T>) {
    const diff = new this(from);
    diff.changeMany(to);
    return diff;
  }

  static compare<T>(from: T, to: Partial<T>) {
    return this.of(from, to).getChangedState();
  }

  private object: DiffChanges<T>;
  private presenter: DiffPresenter<T>;
  private state = DiffState.Unchanged;

  constructor(object: T, presenter: DiffPresenter<T> = defaultPresenter) {
    this.object = Diff.convert(object);
    this.presenter = presenter;
  }

  get unchanged() {
    return this.state === DiffState.Unchanged;
  }

  get allChangesWereNoOps() {
    return this.state === DiffState.AllChangesWereNoOps;
  }

  get<K extends keyof T>(key: K): DiffValue<T[K]> {
    return this.object[key];
  }

  getCurrentState() {
    const out: Partial<T> = {};

    this.eachInternal({
      eachChanged: (value, key) => (out[key] = value.data.to),
      eachUnchanged: (value, key) => (out[key] = value.data),
    });

    return out as T;
  }

  getChangedState() {
    const out: Partial<T> = {};

    this.eachInternal({
      eachChanged: (value, key) => (out[key] = value.data.to),
    });

    return out;
  }

  getChangeString(key: keyof T) {
    return this.presenter(this, key);
  }

  change<K extends keyof T>(key: K, value: T[K]) {
    const prev = this.get(key);
    const prevValue = prev.changed ? prev.data.to : prev.data;

    if (prevValue === value) {
      this.markChangeAsNoOp();
      return;
    }

    this.state = DiffState.Changed;
    this.object[key] = {
      changed: true,
      data: { from: prevValue, to: value },
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

  private eachInternal(each: DiffEach<T>) {
    let key: keyof T;

    for (key in this.object) {
      const value = this.get(key);
      if (value.changed) {
        each.eachChanged?.(value, key);
      } else {
        each.eachUnchanged?.(value, key);
      }
    }
  }

  private markChangeAsNoOp() {
    if (this.state === DiffState.Unchanged) {
      this.state = DiffState.AllChangesWereNoOps;
    }
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
