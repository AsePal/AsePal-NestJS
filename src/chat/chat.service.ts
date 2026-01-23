import { Injectable, UnauthorizedException } from '@nestjs/common';

import { DifyService } from '../dify/dify.service';
import { SSEWriter } from '../dify/dify.types';
import { ChatSendDto } from './dto/chat-send.dto';

@Injectable()
export class ChatService {
  constructor(private readonly dify: DifyService) {}

  async sendMessage(dto: ChatSendDto, userId?: string) {
    if (!userId) throw new UnauthorizedException('Missing userId');

    const result = await this.dify.sendMessage({
      message: dto.message,
      conversationId: dto.conversationId,
      userId,
    });

    return {
      answer: result.answer,
      conversationId: result.conversationId,
    };
  }

  async sendMessageStream(dto: ChatSendDto, userId: string | undefined, writer: SSEWriter) {
    if (!userId) {
      writer.write({ type: 'error', message: 'Missing userId' });
      writer.end();
      return;
    }

    await this.dify.sendMessageStream(
      {
        message: dto.message,
        conversationId: dto.conversationId,
        userId,
      },
      writer,
    );
  }
}
