export class FailurePercentStat {
  private _total = 0;
  private _fails = 0;

  get total() {
    return this._total;
  }

  get fails() {
    return this._fails;
  }

  get percent() {
    if (this.total === 0) return 0;
    return Math.round((this.fails / this.total) * 100);
  }

  succeed() {
    this._total += 1;
  }

  fail() {
    this._total += 1;
    this._fails += 1;
  }
}
