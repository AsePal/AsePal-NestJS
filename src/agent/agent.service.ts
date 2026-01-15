import { Injectable } from '@nestjs/common';
import { LlmService } from '../llm/llm.service';
import { AgentInput } from './agent.types';

@Injectable()
export class AgentService {
  constructor(private readonly llmService: LlmService) {}

  async run(input: AgentInput): Promise<string> {
    return this.llmService.chat(input.message);
  }
}
