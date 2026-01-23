import type { Response } from 'express';

import { Body, Controller, Post, Request, Res, UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ChatService } from './chat.service';
import { ChatSendDto } from './dto/chat-send.dto';

@Controller('chat')
export class ChatController {
  constructor(private readonly chat: ChatService) {}

  @UseGuards(JwtAuthGuard)
  @Post('send')
  async send(@Body() dto: ChatSendDto, @Request() req: any) {
    return this.chat.sendMessage(dto, req.user?.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('stream')
  async stream(@Body() dto: ChatSendDto, @Request() req: any, @Res() res: Response) {
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
