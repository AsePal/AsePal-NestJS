import { DifyModule } from 'src/dify/dify.module';
import { SessionModule } from 'src/session/session.module';

import { Module } from '@nestjs/common';

import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';

@Module({
  imports: [DifyModule, SessionModule],
  controllers: [ChatController],
  providers: [ChatService],
  exports: [ChatService],
})
export class ChatModule {}
