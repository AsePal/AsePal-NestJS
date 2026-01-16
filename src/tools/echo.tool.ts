import { Injectable } from '@nestjs/common';

import { Tool } from '../agent/agent.types';

@Injectable()
export class EchoTool implements Tool {
  name = 'echo';

  async run(input: string): Promise<string> {
    return `【EchoTool】${input.replace('/echo', '').trim()}`;
  }
}
