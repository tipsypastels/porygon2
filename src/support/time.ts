export const Milliseconds = (time: number) => time;
export const Seconds = (time: number) => time * 1000;
export const Minutes = (time: number) => Seconds(time) * 60;
export const Hours = (time: number) => Minutes(time) * 60;
export const Days = (time: number) => Hours(time) * 24;
export const Weeks = (time: number) => Days(time) * 7;
