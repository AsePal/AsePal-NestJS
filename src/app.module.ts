import { Module } from '@nestjs/common';

import { AgentService } from './agent/agent.service';
import { InMemoryMemory } from './agent/memory/in-memory.memory';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ChatController } from './chat/chat.controller';
import { ChatService } from './chat/chat.service';
import { LlmService } from './llm/llm.service';
import { EchoTool } from './tools/echo.tool';

@Module({
  imports: [],
  controllers: [AppController, ChatController],
  providers: [AppService, ChatService, AgentService, LlmService, EchoTool, InMemoryMemory],
})
export class AppModule {}
