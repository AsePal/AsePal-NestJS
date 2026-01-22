import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';

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
}
