import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { ChatModule } from './chat/chat.module';
import { LoggerModule } from './common/logger/logger.module';
import { valkeyConfig } from './config/valkey.config';
import { HealthModule } from './health/health.module';
import { ValkeyModule } from './infra/valkey/valkey.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [valkeyConfig],
    }),
    ChatModule,
    ValkeyModule,
    ConfigModule,
    HealthModule,
    LoggerModule,
  ],
})
export class AppModule {}
