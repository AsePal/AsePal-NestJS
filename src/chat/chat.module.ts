import { Module } from '@nestjs/common';

import { DifyModule } from '../dify/dify.module';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';

@Module({
  imports: [DifyModule],
  controllers: [ChatController],
  providers: [ChatService],
})
export class ChatModule {}
