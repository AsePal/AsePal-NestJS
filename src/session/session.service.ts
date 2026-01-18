import Redis from 'ioredis';

import { Inject, Injectable } from '@nestjs/common';

import { ChatSession } from './session.types';

@Injectable()
export class SessionService {
  private readonly keyPrefix = 'session:';

  constructor(@Inject('VALKEY') private readonly redis: Redis) {}

  async getOrCreate(sessionId: string, userId?: string): Promise<ChatSession> {
    const existing = await this.get(sessionId);
    const now = new Date().toISOString();

    if (existing) {
      const updated: ChatSession = {
        ...existing,
        userId: userId ?? existing.userId,
        lastActiveAt: now,
      };
      await this.set(updated);
      return updated;
    }

    const created: ChatSession = {
      sessionId,
      userId,
      difyConversationId: null,
      lastActiveAt: now,
    };
    await this.set(created);
    return created;
  }

  async updateConversationId(sessionId: string, conversationId: string): Promise<void> {
    const session = await this.getOrCreate(sessionId);
    const updated: ChatSession = {
      ...session,
      difyConversationId: conversationId,
      lastActiveAt: new Date().toISOString(),
    };
    await this.set(updated);
  }

  private async get(sessionId: string): Promise<ChatSession | null> {
    const value = await this.redis.get(this.key(sessionId));
    if (!value) {
      return null;
    }
    try {
      return JSON.parse(value) as ChatSession;
    } catch {
      return null;
    }
  }

  private async set(session: ChatSession): Promise<void> {
    await this.redis.set(this.key(session.sessionId), JSON.stringify(session));
  }

  private key(sessionId: string): string {
    return `${this.keyPrefix}${sessionId}`;
  }
}
