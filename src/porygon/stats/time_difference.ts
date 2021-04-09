import { formatDistance } from 'date-fns';

export class TimeDifferenceStat {
  private _startTime?: Date;

  startTiming() {
    this._startTime = this.currentTime;
  }

  inWords() {
    return formatDistance(this.startTime, this.currentTime);
  }

  get startTime() {
    if (!this._startTime) {
      throw new Error('Timer has not been started.');
    }

    return this._startTime;
  }

  get currentTime() {
    return new Date();
  }
}
