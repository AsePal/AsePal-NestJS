import { Injectable } from '@nestjs/common';
import { AgentService } from '../agent/agent.service';
import { ChatRequestDto } from './dto/chat.request.dto';
import { ChatResponseDto } from './dto/chat.response.dto';

@Injectable()
export class ChatService {
  constructor(private readonly agentService: AgentService) {}

  async chat(dto: ChatRequestDto): Promise<ChatResponseDto> {
    const reply = await this.agentService.run({
      message: dto.message,
      sessionId: dto.sessionId,
      userId: dto.userId,
    });

    return {
      reply,
      sessionId: dto.sessionId,
      debug: {
        agent: 'v0',
      },
    };
  }
}
