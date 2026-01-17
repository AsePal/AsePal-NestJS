import { LoggerService } from 'src/common/logger/logger.service';

import { Body, Controller, Logger, Post } from '@nestjs/common';

import { ChatService } from './chat.service';
import { ChatRequestDto } from './dto/chat.request.dto';
import { ChatResponseDto } from './dto/chat.response.dto';
import { ChatUseCaseResponseDto } from './dto/chat.usecase.response.dto';

@Controller('chat')
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    private readonly logger: LoggerService,
  ) {}

  @Post()
  async chat(@Body() dto: ChatRequestDto): Promise<ChatResponseDto> {
    this.logger.info(`我是日志，我在${ChatController.name}里，后面是dto`, dto);
    return this.chatService.chat(dto);
  }

  @Post('use-case')
  async useCase(@Body() dto: ChatRequestDto): Promise<ChatUseCaseResponseDto> {
    return this.chatService.useCase(dto);
  }
}
