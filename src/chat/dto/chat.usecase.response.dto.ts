export class ChatUseCaseResponseDto {
  sessionId: string;
  steps: Array<{
    reply: string;
    debug: {
      decision: {
        type: 'tool' | 'llm';
        tool?: string;
        reason: string;
      };
      error?: string;
    };
  }>;
}
