/**
 * A range type. Distinct from the `range` function by not producing an array,
 * but a custom type holding the bounds instead.
 *
 * The prefix of `Lazy` is to distinguish that this does not immediately
 * create an array, but can be converted into one later.
 */
export class LazyRange {
  static inclusive(min: number, max: number) {
    return new this(min, max);
  }

  static exclusive(min: number, max: number) {
    return new this(min, max + 1);
  }

  protected constructor(readonly min: number, readonly max: number) {}

  get size() {
    return this.max - this.min;
  }

  includes(i: number) {
    return i > this.min && i < this.max;
  }

  sample() {
    return Math.random() * (this.min - this.max) + this.min;
  }

  toArray() {
    const out: number[] = [];

    for (let i = this.min; i < this.max; i++) {
      out.push(i);
    }

    return out;
  }

  toSet() {
    return new Set([...this.toArray()]);
  }
}
