import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AgentModule } from './agent/agent.module';
import { ChatModule } from './chat/chat.module';
import { valkeyConfig } from './config/valkey.config';
import { ValkeyModule } from './infra/valkey/valkey.module';
import { LlmModule } from './llm/llm.module';
import { ToolsModule } from './tools/tools.module';
import { DebugModule } from './debug/debug.module';
import { HealthModule } from './health/health.module';
import { LoggerModule } from './common/logger/logger.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [valkeyConfig],
    }),
    AgentModule,
    LlmModule,
    ToolsModule,
    ChatModule,
    ValkeyModule,
    ConfigModule,
    DebugModule,
    HealthModule,
    LoggerModule,
  ],
})
export class AppModule {}
