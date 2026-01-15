import { Injectable } from '@nestjs/common';
import { LlmService } from '../llm/llm.service';
import { EchoTool } from '../tools/echo.tool';
import { AgentInput, AgentResult } from './agent.types';

@Injectable()
export class AgentService {
  private readonly memory = new Map<string, string>();

  constructor(
    private readonly llmService: LlmService,
    private readonly echoTool: EchoTool,
  ) {}

  async run(input: AgentInput): Promise<AgentResult> {
    const { message, sessionId } = input;

    if (message.startsWith('/echo')) {
      const reply = await this.echoTool.run(message);
      return {
        reply,
        debug: {
          route: 'tool:echo',
          reason: 'message starts with /echo',
        },
      };
    }

    const lastMessage = this.memory.get(sessionId);
    const prompt = lastMessage
      ? `上一轮: ${lastMessage}\n本轮: ${message}`
      : message;
    const reply = await this.llmService.chat(prompt);
    this.memory.set(sessionId, message);

    return {
      reply,
      debug: {
        route: 'llm',
        reason: 'no tool matched',
      },
    };
  }
}
