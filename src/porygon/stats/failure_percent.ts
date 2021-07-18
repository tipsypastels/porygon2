export class FailurePercentStat {
  private _total = 0;
  private _fails = 0;

  get total() {
    return this._total;
  }

  get passes() {
    return this._total - this.fails;
  }

  get fails() {
    return this._fails;
  }

  get percent() {
    if (this.total === 0) return 0;
    return Math.round((this.fails / this.total) * 100);
  }

  pass() {
    this._total += 1;
  }

  fail() {
    this._total += 1;
    this._fails += 1;
  }

  add(value: boolean) {
    value ? this.pass() : this.fail();
  }
}
