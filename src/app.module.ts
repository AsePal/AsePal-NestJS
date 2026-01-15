import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AgentService } from './agent/agent.service';
import { ChatController } from './chat/chat.controller';
import { ChatService } from './chat/chat.service';
import { LlmService } from './llm/llm.service';

@Module({
  imports: [],
  controllers: [AppController, ChatController],
  providers: [AppService, ChatService, AgentService, LlmService],
})
export class AppModule {}
