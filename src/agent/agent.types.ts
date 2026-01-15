export interface AgentInput {
  message: string;
  sessionId: string;
  userId?: string;
}

export interface Tool {
  name: string;
  run(input: string): Promise<string>;
}

export interface AgentResult {
  reply: string;
  debug: {
    route: 'tool:echo' | 'llm';
    reason: string;
  };
}
