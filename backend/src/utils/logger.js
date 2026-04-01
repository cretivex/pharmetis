import { env } from '../config/env.js';

const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
  verbose: 4
};

const currentLogLevel = logLevels[env.LOG_LEVEL] || logLevels.info;

const shouldLog = (level) => {
  return logLevels[level] <= currentLogLevel;
};

const formatMessage = (level, message, ...args) => {
  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
  
  if (args.length > 0) {
    return `${prefix} ${message} ${JSON.stringify(args, null, env.IS_DEVELOPMENT ? 2 : 0)}`;
  }
  return `${prefix} ${message}`;
};

export const logger = {
  info: (message, ...args) => {
    if (shouldLog('info')) {
      const formatted = formatMessage('info', message, ...args);
      process.stdout.write(formatted + '\n');
    }
  },
  error: (message, ...args) => {
    if (shouldLog('error')) {
      const formatted = formatMessage('error', message, ...args);
      process.stderr.write(formatted + '\n');
    }
  },
  warn: (message, ...args) => {
    if (shouldLog('warn')) {
      const formatted = formatMessage('warn', message, ...args);
      process.stdout.write(formatted + '\n');
    }
  },
  debug: (message, ...args) => {
    if (shouldLog('debug')) {
      const formatted = formatMessage('debug', message, ...args);
      process.stdout.write(formatted + '\n');
    }
  },
  verbose: (message, ...args) => {
    if (shouldLog('verbose')) {
      const formatted = formatMessage('verbose', message, ...args);
      process.stdout.write(formatted + '\n');
    }
  }
};
