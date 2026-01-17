import { Module } from '@nestjs/common';

import { LlmModule } from '../llm/llm.module';
import { ToolsModule } from '../tools/tools.module';
import { AgentService } from './agent.service';
import { InMemoryMemory } from './memory/in-memory.memory';

@Module({
  imports: [LlmModule, ToolsModule],
  providers: [AgentService, InMemoryMemory],
  exports: [AgentService],
})
export class AgentModule {}
