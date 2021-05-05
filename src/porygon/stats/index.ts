import { FailurePercentStat } from './failure_percent';
import { TimeDifferenceStat } from './time_difference';

export const uptime = new TimeDifferenceStat();
export const missedPartialLeaves = new FailurePercentStat();
export const missedPartialDeletions = new FailurePercentStat();
