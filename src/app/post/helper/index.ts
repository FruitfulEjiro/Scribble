import { Injectable } from '@nestjs/common';

@Injectable()
export class PostHelper {
  constructor() {}

  calculateReadTime(content: string[], wordsPerMinute: number = 200): number {
    const wordCount = content
      .join(' ')
      .trim()
      .split(/\s+/)
      .filter(Boolean).length;
    const minutes = wordCount / wordsPerMinute;
    return Math.max(1, Math.ceil(minutes));
  }
}
