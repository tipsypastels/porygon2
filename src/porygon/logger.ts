import { createLogger, transports, format, addColors } from 'winston';

const LEVELS = splitWinstonLevels({
  error: 'red',
  warn: 'yellow',
  info: 'green',
  setup: 'blue',
  task: 'cyan',
  verbose: 'magenta',
  debug: 'bgRed',
});

const formatInline = format.printf((info) => {
  return `${info.timestamp} ${info.level}: ${info.message}`;
});

export const logger = createLogger({
  levels: LEVELS.levels,
  level: 'info',
  transports: [
    new transports.File({
      filename: 'error.log',
      level: 'error',
      format: format.combine(
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        formatInline,
      ),
    }),
    new transports.Console({
      format: format.combine(
        format.timestamp({ format: 'HH:mm:ss' }),
        format.colorize(),
        formatInline,
      ),
      level: 'debug',
    }),
  ],
});

addColors(LEVELS.colors);

function splitWinstonLevels(colors: Record<string, string>) {
  const levels: Record<string, number> = {};
  let i = 0;

  for (const key in colors) {
    levels[key] = i++;
  }

  return { levels, colors };
}
