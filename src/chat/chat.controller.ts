import type { Response } from 'express';

import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ChatService } from './chat.service';
import { ChatSendDto } from './dto/chat-send.dto';
import { ConversationRenameDto } from './dto/conversation-rename.dto';
import { ConversationsQueryDto } from './dto/conversations-query.dto';
import { MessagesQueryDto } from './dto/messages-query.dto';

interface JwtAuthenticatedRequest {
  user?: { userId: string; username: string };
}

@Controller('chat')
export class ChatController {
  constructor(private readonly chat: ChatService) {}

  @UseGuards(JwtAuthGuard)
  @Get('conversations')
  async getConversations(
    @Query() query: ConversationsQueryDto,
    @Request() req: JwtAuthenticatedRequest,
  ) {
    return this.chat.getConversations(query, req.user?.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('messages')
  async getMessages(@Query() query: MessagesQueryDto, @Request() req: JwtAuthenticatedRequest) {
    return this.chat.getMessages(query, req.user?.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('conversations/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteConversation(@Param('id') id: string, @Request() req: JwtAuthenticatedRequest) {
    await this.chat.deleteConversation(id, req.user?.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('conversations/:id/name')
  async renameConversation(
    @Param('id') id: string,
    @Body() dto: ConversationRenameDto,
    @Request() req: JwtAuthenticatedRequest,
  ) {
    return this.chat.renameConversation(id, dto, req.user?.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('send')
  async send(@Body() dto: ChatSendDto, @Request() req: JwtAuthenticatedRequest) {
    return this.chat.sendMessage(dto, req.user?.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('stream')
  async stream(
    @Body() dto: ChatSendDto,
    @Request() req: JwtAuthenticatedRequest,
    @Res() res: Response,
  ) {
    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    await this.chat.sendMessageStream(dto, req.user?.userId, {
      write: (event) => {
        res.write(`data: ${JSON.stringify(event)}\n\n`);
      },
      end: () => res.end(),
    });
  }
}
