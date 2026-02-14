import { Injectable, UnauthorizedException } from '@nestjs/common';

import { DifyService } from '../dify/dify.service';
import {
  ConversationListResult,
  MessageListResult,
  RenameConversationResult,
} from '../dify/dify.types';
import { SSEWriter } from '../dify/dify.types';
import { ChatSendDto } from './dto/chat-send.dto';
import { ConversationRenameDto } from './dto/conversation-rename.dto';
import { ConversationsQueryDto } from './dto/conversations-query.dto';
import { MessagesQueryDto } from './dto/messages-query.dto';

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

  async getConversations(
    query: ConversationsQueryDto,
    userId?: string,
  ): Promise<ConversationListResult> {
    if (!userId) throw new UnauthorizedException('Missing userId');

    return this.dify.getConversations({
      userId,
      limit: query.limit,
      lastId: query.last_id,
    });
  }

  async getMessages(query: MessagesQueryDto, userId?: string): Promise<MessageListResult> {
    if (!userId) throw new UnauthorizedException('Missing userId');

    return this.dify.getMessages({
      userId,
      conversationId: query.conversation_id,
      firstId: query.first_id,
      limit: query.limit,
    });
  }

  async deleteConversation(conversationId: string, userId?: string): Promise<void> {
    if (!userId) throw new UnauthorizedException('Missing userId');

    await this.dify.deleteConversation(conversationId, userId);
  }

  async renameConversation(
    conversationId: string,
    dto: ConversationRenameDto,
    userId?: string,
  ): Promise<RenameConversationResult> {
    if (!userId) throw new UnauthorizedException('Missing userId');

    return this.dify.renameConversation({
      userId,
      conversationId,
      name: dto.name,
      autoGenerate: dto.autoGenerate,
    });
  }
}
