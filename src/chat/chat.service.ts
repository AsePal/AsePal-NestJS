import { randomUUID } from 'node:crypto';

import { Injectable, UnauthorizedException } from '@nestjs/common';

import { DifyService } from '../dify/dify.service';
import { ChatSendDto } from './dto/chat-send.dto';

@Injectable()
export class ChatService {
  constructor(private readonly dify: DifyService) {}

  async sendMessage(dto: ChatSendDto, userId?: string) {
    if (!userId) {
      throw new UnauthorizedException('Missing userId');
    }

    // const conversationId = dto.conversationId ?? randomUUID();
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
}
