import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { PostService } from './post.service';
import { CurrentUser } from '../auth/decorators';
import { AuthenticatedUser } from 'src/lib/types/auth.types';
import { CreatePostDto } from './dtos';

@Controller('/posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Post('/create')
  @HttpCode(HttpStatus.OK)
  async createPost(
    @CurrentUser() user: AuthenticatedUser,
    @Body() data: CreatePostDto,
  ) {
    const post = await this.postService.create(data, user);

    return {
      status: true,
      message: 'post cereated successfully',
      data: post,
    };
  }
}
