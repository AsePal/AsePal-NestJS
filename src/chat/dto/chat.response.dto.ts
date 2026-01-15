export class ChatResponseDto {
  reply: string;
  sessionId: string;
  debug?: {
    route: 'tool:echo' | 'llm';
    reason: string;
  };
}
