import { Injectable } from '@nestjs/common';

@Injectable()
export class LlmService {
  async chat(prompt: string): Promise<string> {
    return `echo: ${prompt}`;
  }
}
