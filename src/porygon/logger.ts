import { createLogger, transports, format } from 'winston';

const formatInline = format.printf((info) => {
  return `${info.timestamp} ${info.level}: ${info.message}`;
});

export const logger = createLogger({
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
