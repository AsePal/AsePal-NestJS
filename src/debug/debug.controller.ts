import { ValkeyHealthService } from 'src/infra/valkey/valkey.health';

import { Controller, Get } from '@nestjs/common';

@Controller('debug')
export class DebugController {
  constructor(private readonly valkeyHealth: ValkeyHealthService) {}

  @Get('valkey')
  async checkValkey() {
    return {
      valkey: await this.valkeyHealth.ping(),
    };
  }
}
