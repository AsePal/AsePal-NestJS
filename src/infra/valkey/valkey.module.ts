import Redis from 'ioredis';

import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { ValkeyHealthService } from './valkey.health';

interface ValkeyConfig {
  host: string;
  port: number;
  password?: string;
  db: number;
  connectTimeout: number;
}

@Global()
@Module({
  providers: [
    {
      provide: 'VALKEY',
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => {
        const cfg = config.get<ValkeyConfig>('valkey')!;
        const redis = new Redis({
          host: cfg.host,
          port: cfg.port,
          password: cfg.password || undefined,
          db: cfg.db,
          connectTimeout: cfg.connectTimeout,
        });
        try {
          await redis.ping();
          console.log('[Valkey] connected');
        } catch {
          process.exit(1);
        }
        return redis;
      },
    },
    ValkeyHealthService,
  ],
  exports: ['VALKEY', ValkeyHealthService],
})
export class ValkeyModule {}
