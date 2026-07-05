import { Logger } from '@nestjs/common';

export interface LogEntry {
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';
  event: string;
  [key: string]: any;
}

export class StructuredLogger extends Logger {
  log(entry: LogEntry | string, context?: string) {
    if (typeof entry === 'string') {
      super.log(entry, context);
    } else {
      super.log(JSON.stringify(entry), context);
    }
  }

  error(entry: LogEntry | string, context?: string) {
    if (typeof entry === 'string') {
      super.error(entry, context);
    } else {
      super.error(JSON.stringify(entry), context);
    }
  }

  warn(entry: LogEntry | string, context?: string) {
    if (typeof entry === 'string') {
      super.warn(entry, context);
    } else {
      super.warn(JSON.stringify(entry), context);
    }
  }

  debug(entry: LogEntry | string, context?: string) {
    if (typeof entry === 'string') {
      super.debug(entry, context);
    } else {
      super.debug(JSON.stringify(entry), context);
    }
  }
}
