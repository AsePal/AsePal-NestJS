export class ChatResponseDto {
  reply: string;
  sessionId: string;
  debug?: {
    decision: {
      type: 'tool' | 'llm';
      tool?: string;
      reason: string;
    };
    error?: string;
  };
}
