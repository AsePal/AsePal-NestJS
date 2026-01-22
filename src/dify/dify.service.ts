import { LoggerService } from 'src/common/logger/logger.service';

import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import {
  DifyChatRequest,
  DifyChatResponse,
  DifyResponseMode,
  DifySendMessageInput,
  DifySendMessageResult,
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

  private buildUrl(path: string): string {
    const base = this.baseUrl.endsWith('/') ? this.baseUrl.slice(0, -1) : this.baseUrl;
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return `${base}${normalizedPath}`;
  }
}
