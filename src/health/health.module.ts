import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';

import { HealthController } from './health.controller';
import { ValkeyHealthChecker } from './valkey.health-checker';

@Module({
  imports: [TerminusModule],
  controllers: [HealthController],
  providers: [ValkeyHealthChecker],
})
export class HealthModule {}
