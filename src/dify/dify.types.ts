export type DifyResponseMode = 'blocking' | 'streaming';

export interface DifyChatRequest {
  query: string;
  response_mode: DifyResponseMode;
  user: string;
  conversation_id?: string;
  inputs?: Record<string, any>;
}

export interface DifyChatResponse {
  answer: string;
  conversation_id: string;
}

export interface DifySendMessageInput {
  message: string;
  userId: string;
  conversationId?: string;
}

export interface DifySendMessageResult {
  answer: string;
  conversationId: string;
}
