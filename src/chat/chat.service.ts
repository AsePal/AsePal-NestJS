import { LoggerService } from 'src/common/logger/logger.service';
import { DifyService } from 'src/dify/dify.service';
import { SessionService } from 'src/session/session.service';

import { Injectable, InternalServerErrorException } from '@nestjs/common';

import { ChatRequestDto } from './dto/chat.request.dto';
import { ChatResponseDto } from './dto/chat.response.dto';

@Injectable()
export class ChatService {
  constructor(
    private readonly sessionService: SessionService,
    private readonly difyService: DifyService,
    private readonly logger: LoggerService,
  ) {}

  async chat(dto: ChatRequestDto): Promise<ChatResponseDto> {
    try {
      const session = await this.sessionService.getOrCreate(dto.sessionId, dto.userId);
      const difyResult = await this.difyService.sendMessage({
        message: dto.message,
        userId: dto.userId ?? session.userId ?? dto.sessionId,
        conversationId: session.difyConversationId ?? undefined,
      });
      await this.sessionService.updateConversationId(session.sessionId, difyResult.conversationId);
      this.logger.info('Dify response received', {
        sessionId: session.sessionId,
        difyConversationId: difyResult.conversationId,
      });
      return {
        reply: difyResult.answer,
        sessionId: session.sessionId,
      };
    } catch (error) {
      this.logger.error('Chat gateway failed', {
        message: error instanceof Error ? error.message : 'unknown error',
      });
      throw new InternalServerErrorException('Dify gateway error');
    }
  }
}
