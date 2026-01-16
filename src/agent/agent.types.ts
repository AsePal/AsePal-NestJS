export interface AgentInput {
  message: string;
  sessionId: string;
  userId?: string;
}

export type Decision = {
  type: 'tool' | 'llm';
  reason: string;
  toolName?: string;
};

export interface Tool {
  name: string;
  run(input: string): Promise<string>;
}

export interface Memory {
  get(sessionId: string): Promise<string | null>;
  set(sessionId: string, value: string): Promise<void>;
}

export interface AgentResult {
  reply: string;
  debug: {
    decision: {
      type: 'tool' | 'llm';
      tool?: string;
      reason: string;
    };
    error?: string;
  };
}
