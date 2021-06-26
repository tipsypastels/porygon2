import get from 'lodash.get';
import set from 'lodash.set';
import { get as cacheGet } from './cache';
import type { Kind } from './kind';

/** @internal */
export class Hydrator {
  private out: any;
  private queue: Promise<void>[] = [];

  constructor(raw: any) {
    this.out = { ...raw };
  }

  async hydrate() {
    await Promise.all(this.queue);

    this.queue = [];

    return this.out;
  }

  for(path: string) {
    return new Entry(path, this);
  }

  _add(fn: () => Promise<void>) {
    this.queue.push(fn());
    return this;
  }

  _get(path: string) {
    return get(this.out, path);
  }

  _set(path: string, value: any) {
    set(this.out, path, value);
  }
}

class Entry {
  private queue: (() => Promise<void>)[] = [];

  constructor(private path: string, private hydrator: Hydrator) {}

  kind(kind: Kind) {
    return this.add(async () => {
      const id = this.get() as string;
      const entry = await cacheGet(kind, id);

      this.set(entry);
    });
  }

  kindArray(kind: Kind) {
    return this.add(async () => {
      const ids = this.get() as string[];
      const promises = ids.map(async (id, index) => {
        const entry = await cacheGet(kind, id);
        this.hydrator._set(`${this.path}[${index}]`, entry);
      });

      await Promise.all(promises);
    });
  }

  map(fn: (value: any) => any) {
    return this.add(async () => {
      this.set(fn(this.get()));
    });
  }

  ok() {
    const { queue } = this;

    if (queue.length === 0) {
      throw new Error(
        "Can't call .ok() on an empty hydrator. Use .kind(), .map() or the like first.",
      );
    }

    this.hydrator._add(async () => {
      for (const fn of queue) {
        await fn();
      }
    });
  }

  private add(fn: () => Promise<void>) {
    this.queue.push(fn);
    return this;
  }

  private get() {
    return this.hydrator._get(this.path);
  }

  private set(value: any) {
    return this.hydrator._set(this.path, value);
  }
}
