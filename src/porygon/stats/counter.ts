export class CounterStat {
  constructor(private _value = 0) {}

  get value() {
    return this._value;
  }

  increment(by = 1) {
    this._value += by;
  }
}
