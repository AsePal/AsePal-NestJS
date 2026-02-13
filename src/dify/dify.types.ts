export type DifyResponseMode = 'blocking' | 'streaming';

// ========== 会话列表类型 ==========

export interface DifyConversationItem {
  id: string;
  name: string;
  inputs: Record<string, any>;
  status: string;
  introduction: string;
  created_at: number;
  updated_at: number;
}

export interface DifyConversationsResponse {
  limit: number;
  has_more: boolean;
  data: DifyConversationItem[];
}

export interface GetConversationsInput {
  userId: string;
  limit?: number;
  lastId?: string;
}

export interface ConversationListResult {
  hasMore: boolean;
  items: {
    id: string;
    title: string;
    createdAt: number;
    updatedAt: number;
  }[];
}

// ========== 消息历史类型 ==========

export interface DifyMessageItem {
  id: string;
  conversation_id: string;
  inputs: Record<string, any>;
  query: string;
  answer: string;
  message_files: {
    id: string;
    type: string;
    url: string;
    belongs_to: string;
  }[];
  feedback: {
    rating: string;
  } | null;
  retriever_resources: {
    position: number;
    dataset_id: string;
    dataset_name: string;
    document_id: string;
    document_name: string;
    segment_id: string;
    score: number;
    content: string;
  }[];
  created_at: number;
}

export interface DifyMessagesResponse {
  limit: number;
  has_more: boolean;
  data: DifyMessageItem[];
}

export interface GetMessagesInput {
  userId: string;
  conversationId: string;
  firstId?: string;
  limit?: number;
}

export interface MessageListResult {
  data: {
    conversationId: string;
    hasMore: boolean;
    items: {
      id: string;
      role: 'user' | 'assistant';
      type: 'text';
      content: string;
    }[];
  };
}

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

// ========== SSE 流式传输类型 ==========

// Dify SSE 事件类型
export type DifySSEEvent =
  | DifyMessageEvent
  | DifyMessageEndEvent
  | DifyAgentMessageEvent
  | DifyAgentThoughtEvent
  | DifyErrorEvent;

export interface DifyMessageEvent {
  event: 'message';
  message_id: string;
  conversation_id: string;
  answer: string;
  created_at: number;
}

export interface DifyMessageEndEvent {
  event: 'message_end';
  message_id: string;
  conversation_id: string;
  metadata: {
    usage: {
      prompt_tokens: number;
      completion_tokens: number;
      total_tokens: number;
    };
  };
}

export interface DifyAgentMessageEvent {
  event: 'agent_message';
  message_id: string;
  conversation_id: string;
  answer: string;
  created_at: number;
}

export interface DifyAgentThoughtEvent {
  event: 'agent_thought';
  message_id: string;
  conversation_id: string;
  thought: string;
  tool: string;
  tool_input: string;
  observation: string;
}

export interface DifyErrorEvent {
  event: 'error';
  message_id?: string;
  status: number;
  code: string;
  message: string;
}

// 前端 SSE 输出类型
export interface SSEStartEvent {
  type: 'start';
  conversationId: string;
  messageId: string;
}

export interface SSEDeltaEvent {
  type: 'delta';
  text: string;
}

export interface SSEEndEvent {
  type: 'end';
  conversationId: string;
  messageId: string;
  usage: {
    total_tokens: number;
  };
}

export interface SSEErrorEvent {
  type: 'error';
  message: string;
}

export type SSEOutputEvent = SSEStartEvent | SSEDeltaEvent | SSEEndEvent | SSEErrorEvent;

// SSE Writer 接口
export interface SSEWriter {
  write: (event: SSEOutputEvent) => void;
  end: () => void;
}
