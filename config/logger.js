const winston = require('winston');
const { combine, timestamp, printf, colorize, errors } = winston.format;

class Logger {
  constructor() {
    this.logFormat = printf(({ level, message, timestamp, stack }) => {
      return `${timestamp} [${level.toUpperCase()}]: ${stack || message}`;
    });

    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: combine(
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        errors({ stack: true }),
        this.logFormat
      ),
      transports: [
        // Console transport (colorido)
        new winston.transports.Console({
          format: combine(colorize(), this.logFormat)
        }),
        // File transport (erros)
        new winston.transports.File({ 
          filename: 'logs/error.log', 
          level: 'error',
          maxsize: 5242880 // 5MB
        }),
        // File transport (todos os logs)
        new winston.transports.File({ 
          filename: 'logs/combined.log',
          maxsize: 5242880 // 5MB
        })
      ],
      exceptionHandlers: [
        new winston.transports.File({ filename: 'logs/exceptions.log' })
      ]
    });

    if (process.env.NODE_ENV !== 'production') {
      this.logger.add(new winston.transports.Console({
        format: combine(colorize(), this.logFormat)
      }));
    }
  }

  static getInstance() {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance.logger;
  }
}

module.exports = Logger.getInstance();