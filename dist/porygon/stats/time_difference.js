"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TimeDifferenceStat = void 0;
const date_fns_1 = require("date-fns");
class TimeDifferenceStat {
    startTiming() {
        this._startTime = this.currentTime;
    }
    inWords() {
        return date_fns_1.formatDistance(this.startTime, this.currentTime);
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
exports.TimeDifferenceStat = TimeDifferenceStat;
