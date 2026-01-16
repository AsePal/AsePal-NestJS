import { Injectable } from '@nestjs/common';

import { Memory } from '../agent.types';

@Injectable()
export class InMemoryMemory implements Memory {
  private readonly store = new Map<string, string>();

  async get(sessionId: string): Promise<string | null> {
    return this.store.get(sessionId) ?? null;
  }

  async set(sessionId: string, value: string): Promise<void> {
    this.store.set(sessionId, value);
  }
}
