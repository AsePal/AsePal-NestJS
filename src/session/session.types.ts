export interface ChatSession {
  sessionId: string;
  userId?: string;
  difyConversationId?: string | null;
  lastActiveAt: string;
}
