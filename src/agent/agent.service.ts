import { Injectable } from '@nestjs/common';

import { LlmService } from '../llm/llm.service';
import { EchoTool } from '../tools/echo.tool';
import { AgentInput, AgentResult, Decision } from './agent.types';
import { InMemoryMemory } from './memory/in-memory.memory';

@Injectable()
export class AgentService {
  constructor(
    private readonly llmService: LlmService,
    private readonly echoTool: EchoTool,
    private readonly memory: InMemoryMemory,
  ) {}

  decide(input: AgentInput): Decision {
    const { message } = input;

    if (message.startsWith('/echo')) {
      return {
        type: 'tool',
        toolName: 'echo',
        reason: 'message starts with /echo',
      };
    }

    return {
      type: 'llm',
      reason: 'no tool matched',
    };
  }

  async execute(decision: Decision, input: AgentInput, meta?: { error?: string }): Promise<string> {
    try {
      if (decision.type === 'tool') {
        if (decision.toolName === 'echo') {
          return await this.echoTool.run(input.message);
        }

        throw new Error(`unknown tool: ${decision.toolName}`);
      }

      const lastMessage = await this.memory.get(input.sessionId);
      const prompt = lastMessage ? `上一轮: ${lastMessage}\n本轮: ${input.message}` : input.message;
      const reply = await this.llmService.chat(prompt);
      await this.memory.set(input.sessionId, input.message);
      return reply;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'unknown error';
      if (meta) {
        meta.error = message;
      }
      return '执行失败，请重试';
    }
  }

  async run(input: AgentInput): Promise<AgentResult> {
    const decision = this.decide(input);
    const meta: { error?: string } = {};
    const reply = await this.execute(decision, input, meta);

    return {
      reply,
      debug: {
        decision: {
          type: decision.type,
          tool: decision.toolName,
          reason: decision.reason,
        },
        error: meta.error,
      },
    };
  }
}
