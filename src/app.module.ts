import { Module } from '@nestjs/common';

import { AgentModule } from './agent/agent.module';
import { ChatModule } from './chat/chat.module';
import { LlmModule } from './llm/llm.module';
import { ToolsModule } from './tools/tools.module';

@Module({
  imports: [AgentModule, LlmModule, ToolsModule, ChatModule],
})
export class AppModule {}
