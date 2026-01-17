import { Controller, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckService } from '@nestjs/terminus';

import { ValkeyHealthChecker } from './valkey.health-checker';

@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly valkey: ValkeyHealthChecker,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([() => this.valkey.check('valkey')]);
  }
}
