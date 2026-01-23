import { LoggerService } from 'src/common/logger/logger.service';

import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import {
  DifyChatRequest,
  DifyChatResponse,
  DifyResponseMode,
  DifySSEEvent,
  DifySendMessageInput,
  DifySendMessageResult,
  SSEWriter,
} from './dify.types';

@Injectable()
export class DifyService {
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly responseMode: DifyResponseMode;
  private readonly timeoutMs: number;

  constructor(
    private readonly config: ConfigService,
    private readonly logger: LoggerService,
  ) {
    this.baseUrl = this.config.get<string>('DIFY_BASE_URL') ?? process.env.DIFY_BASE_URL ?? '';
    this.apiKey = this.config.get<string>('DIFY_API_KEY') ?? process.env.DIFY_API_KEY ?? '';
    this.responseMode = (this.config.get<string>('DIFY_RESPONSE_MODE') ??
      process.env.DIFY_RESPONSE_MODE ??
      'blocking') as DifyResponseMode;
    this.timeoutMs = Number(
      this.config.get<string>('DIFY_TIMEOUT_MS') ?? process.env.DIFY_TIMEOUT_MS ?? 15000,
    );
  }

  async sendMessage(input: DifySendMessageInput): Promise<DifySendMessageResult> {
    if (!this.baseUrl || !this.apiKey) {
      throw new InternalServerErrorException('Dify configuration missing');
    }

    const body: DifyChatRequest = {
      query: input.message,
      response_mode: this.responseMode,
      user: input.userId,
      conversation_id: input.conversationId,
      inputs: {},
    };

    const url = this.buildUrl('/v1/chat-messages');
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error('Dify request failed', {
          status: response.status,
          body: errorText,
        });
        throw new InternalServerErrorException('Dify request failed');
      }

      const data = (await response.json()) as DifyChatResponse;
      if (!data?.answer || !data?.conversation_id) {
        this.logger.error('Dify response invalid', { data });
        throw new InternalServerErrorException('Dify response invalid');
      }

      return {
        answer: data.answer,
        conversationId: data.conversation_id,
      };
    } catch (error) {
      if (error instanceof InternalServerErrorException) {
        throw error;
      }
      this.logger.error('Dify request error', {
        message: error instanceof Error ? error.message : 'unknown error',
      });
      throw new InternalServerErrorException('Dify request error');
    } finally {
      clearTimeout(timer);
    }
  }

  /**
   * 流式发送消息到 Dify，并通过 SSEWriter 输出格式化后的事件
   */
  async sendMessageStream(input: DifySendMessageInput, writer: SSEWriter): Promise<void> {
    if (!this.baseUrl || !this.apiKey) {
      writer.write({ type: 'error', message: 'Dify configuration missing' });
      writer.end();
      return;
    }

    const body: DifyChatRequest = {
      query: input.message,
      response_mode: 'streaming', // 流式模式
      user: input.userId,
      conversation_id: input.conversationId,
      inputs: {},
    };

    const url = this.buildUrl('/v1/chat-messages');
    const controller = new AbortController();
    // 流式请求超时时间可以更长
    const streamTimeoutMs = this.timeoutMs * 10;
    const timer = setTimeout(() => controller.abort(), streamTimeoutMs);

    let startEventSent = false;
    let conversationId = '';
    let messageId = '';

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          Accept: 'text/event-stream',
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error('Dify stream request failed', {
          status: response.status,
          body: errorText,
        });
        writer.write({ type: 'error', message: 'Dify request failed' });
        writer.end();
        return;
      }

      if (!response.body) {
        writer.write({ type: 'error', message: 'No response body' });
        writer.end();
        return;
      }

      // 解析 SSE 流
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // 保留未完成的行

        for (const line of lines) {
          if (!line.startsWith('data:')) continue;

          const jsonStr = line.slice(5).trim();
          if (!jsonStr || jsonStr === '[DONE]') continue;

          try {
            const event = JSON.parse(jsonStr) as DifySSEEvent;
            this.handleDifyEvent(event, writer, {
              startEventSent,
              setStartEventSent: (v) => (startEventSent = v),
              setConversationId: (v) => (conversationId = v),
              setMessageId: (v) => (messageId = v),
              getConversationId: () => conversationId,
              getMessageId: () => messageId,
            });
          } catch (parseError) {
            this.logger.error('Failed to parse SSE event', { line, error: parseError });
          }
        }
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        writer.write({ type: 'error', message: 'Request timeout' });
      } else {
        this.logger.error('Dify stream error', {
          message: error instanceof Error ? error.message : 'unknown error',
        });
        writer.write({ type: 'error', message: 'Stream error' });
      }
    } finally {
      clearTimeout(timer);
      writer.end();
    }
  }

  /**
   * 处理 Dify SSE 事件，转换为前端格式
   */
  private handleDifyEvent(
    event: DifySSEEvent,
    writer: SSEWriter,
    state: {
      startEventSent: boolean;
      setStartEventSent: (v: boolean) => void;
      setConversationId: (v: string) => void;
      setMessageId: (v: string) => void;
      getConversationId: () => string;
      getMessageId: () => string;
    },
  ): void {
    switch (event.event) {
      case 'message':
      case 'agent_message': {
        // 首次收到消息时，发送 start 事件
        if (!state.startEventSent) {
          state.setStartEventSent(true);
          state.setConversationId(event.conversation_id);
          state.setMessageId(event.message_id);
          writer.write({
            type: 'start',
            conversationId: event.conversation_id,
            messageId: event.message_id,
          });
        }
        // 发送 delta 事件
        if (event.answer) {
          writer.write({
            type: 'delta',
            text: event.answer,
          });
        }
        break;
      }

      case 'message_end': {
        writer.write({
          type: 'end',
          conversationId: event.conversation_id,
          messageId: event.message_id,
          usage: {
            total_tokens: event.metadata?.usage?.total_tokens ?? 0,
          },
        });
        break;
      }

      case 'error': {
        writer.write({
          type: 'error',
          message: event.message || 'Unknown error',
        });
        break;
      }

      case 'agent_thought': {
        // 可以选择是否将 agent 思考过程发送给前端
        // 这里暂时忽略
        break;
      }
    }
  }

  private buildUrl(path: string): string {
    const base = this.baseUrl.endsWith('/') ? this.baseUrl.slice(0, -1) : this.baseUrl;
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return `${base}${normalizedPath}`;
  }
}
