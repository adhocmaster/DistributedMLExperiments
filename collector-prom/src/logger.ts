import * as winston from 'winston'
import * as path from 'path'

let logPath = 'logs/';
let log_level = 'info';

export const logger = winston.createLogger({
  level: log_level,
  format: winston.format.json(),
  transports: [
    new winston.transports.File({
      filename: path.join(logPath, 'access.log'),
      level: log_level
    }),
    new winston.transports.File({
      filename: path.join(logPath, 'error.log'),
      level: 'error'
    }),
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
    level:'debug'
  }));
}
