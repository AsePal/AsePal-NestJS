export class ChatResponseDto {
  reply: string;
  sessionId: string;
  debug?: {
    agent: string;
    toolUsed?: string;
  };
}
