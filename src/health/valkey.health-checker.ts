import Redis from 'ioredis';

import { Inject, Injectable } from '@nestjs/common';
import { HealthIndicatorService } from '@nestjs/terminus';

@Injectable()
export class ValkeyHealthChecker {
  constructor(
    private readonly indicator: HealthIndicatorService,
    @Inject('VALKEY') private readonly redis: Redis,
  ) {}

  async check(key = 'valkey') {
    const status = this.indicator.check(key);

    try {
      await this.redis.ping();
      return status.up();
    } catch (e) {
      return status.down({
        message: 'Valkey ping failed',
      });
    }
  }
}
