import { formatDistance as format } from 'date-fns';
import { tap } from 'support/fn';

export class TimeDifference {
  private _start_time?: Date;

  static start_timing() {
    return tap((s) => s.start_timing(), new this());
  }

  start_timing() {
    this._start_time = this.current_time;
  }

  get start_time() {
    if (!this._start_time) throw new Error('Timer has not been started!');
    return this._start_time;
  }

  get current_time() {
    return new Date();
  }

  get difference() {
    return +this.current_time - +this.start_time;
  }

  in_words() {
    return format(this.start_time, this.current_time);
  }
}
