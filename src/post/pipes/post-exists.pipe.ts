import { Injectable, NotFoundException } from '@nestjs/common';
import { PostService } from '../post.service';

@Injectable()
export class PostExistsPipe {
  constructor(private readonly postService: PostService) {}

  async transform(value: string) {
    const user = await this.postService.findPostById(value);
    if (!user)
      throw new NotFoundException(`Post with the ID ${value} does not exist.`);
    return value;
  }
}
