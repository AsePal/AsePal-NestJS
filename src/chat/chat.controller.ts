import { Body, Controller, Post } from '@nestjs/common';

import { ChatService } from './chat.service';
import { ChatRequestDto } from './dto/chat.request.dto';
import { ChatResponseDto } from './dto/chat.response.dto';
import { ChatUseCaseResponseDto } from './dto/chat.usecase.response.dto';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  async chat(@Body() dto: ChatRequestDto): Promise<ChatResponseDto> {
    return this.chatService.chat(dto);
  }

  @Post('use-case')
  async useCase(@Body() dto: ChatRequestDto): Promise<ChatUseCaseResponseDto> {
    return this.chatService.useCase(dto);
  }
}
