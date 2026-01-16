import { Injectable } from '@nestjs/common';

import { AgentService } from '../agent/agent.service';
import { ChatRequestDto } from './dto/chat.request.dto';
import { ChatResponseDto } from './dto/chat.response.dto';
import { ChatUseCaseResponseDto } from './dto/chat.usecase.response.dto';

@Injectable()
export class ChatService {
  constructor(private readonly agentService: AgentService) {}

  async chat(dto: ChatRequestDto): Promise<ChatResponseDto> {
    const result = await this.agentService.run({
      message: dto.message,
      sessionId: dto.sessionId,
      userId: dto.userId,
    });

    return {
      reply: result.reply,
      sessionId: dto.sessionId,
      debug: result.debug,
    };
  }

  async useCase(dto: ChatRequestDto): Promise<ChatUseCaseResponseDto> {
    const first = await this.agentService.run({
      message: `请把下面需求转成TODO:\n${dto.message}`,
      sessionId: dto.sessionId,
      userId: dto.userId,
    });

    const second = await this.agentService.run({
      message: '再用一句话总结上面的TODO',
      sessionId: dto.sessionId,
      userId: dto.userId,
    });

    return {
      sessionId: dto.sessionId,
      steps: [
        {
          reply: first.reply,
          debug: first.debug,
        },
        {
          reply: second.reply,
          debug: second.debug,
        },
      ],
    };
  }
}
