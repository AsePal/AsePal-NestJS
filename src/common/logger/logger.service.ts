import { Injectable } from '@nestjs/common';

import { requestContext } from '../context/request-context';

@Injectable()
export class LoggerService {
  private base(level: string, message: string, meta?: Record<string, unknown>) {
    const requestId = requestContext.getStore()?.requestId;

    const log = {
      timestamp: new Date().toISOString(),
      level,
      message,
      requestId,
      ...meta,
    };

    console.log(JSON.stringify(log));
  }

  info(message: string, meta?: Record<string, unknown>) {
    this.base('info', message, meta);
  }

  error(message: string, meta?: Record<string, unknown>) {
    this.base('error', message, meta);
  }
}
