import { Injectable } from '@nestjs/common';

@Injectable()
export class LlmService {
  async chat(prompt: string): Promise<string> {
    const content = this.extractCurrentMessage(prompt);
    const todo = this.tryBuildTodo(content);
    if (todo) {
      return todo;
    }

    return `echo: ${prompt}`;
  }

  private extractCurrentMessage(prompt: string): string {
    const marker = '本轮:';
    if (prompt.includes(marker)) {
      return prompt.split(marker).pop()?.trim() ?? prompt;
    }

    return prompt;
  }

  private tryBuildTodo(content: string): string | null {
    if (!/todo|TODO|转成TODO/.test(content)) {
      return null;
    }

    const afterColon = this.extractAfterColon(content);
    const body = afterColon || content.replace(/.*TODO\s*/i, '').trim();
    if (!body) {
      return null;
    }

    const items = body
      .split(/[。.!?;\n]/)
      .map((item) => item.trim())
      .filter((item) => item.length > 0);

    if (items.length === 0) {
      return null;
    }

    return items.map((item) => `- [ ] ${item}`).join('\n');
  }

  private extractAfterColon(text: string): string | null {
    const colonIndex = Math.max(text.lastIndexOf(':'), text.lastIndexOf('：'));
    if (colonIndex === -1) {
      return null;
    }

    return text.slice(colonIndex + 1).trim();
  }
}
