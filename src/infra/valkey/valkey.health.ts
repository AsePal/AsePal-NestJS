import Redis from 'ioredis';

import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class ValkeyHealthService {
  constructor(@Inject('VALKEY') private readonly redis: Redis) {}

  async ping(): Promise<boolean> {
    try {
      const res = await this.redis.ping();
      return res === 'PONG';
    } catch (e) {
      return false;
    }
  }
}
