import * as winston from 'winston';

declare module 'winston' {
  export interface Logger {
    setup: winston.LeveledLogMethod;
    task: winston.LeveledLogMethod;
    cmd: winston.LeveledLogMethod;
  }
}
