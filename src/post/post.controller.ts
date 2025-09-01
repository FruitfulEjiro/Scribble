import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { PostService } from './post.service';
import CreatePostDto from './dto/create-post.dto';
import { Roles } from 'src/roles/roles.decorator';
import { Role } from 'src/roles/roles.enum';
import { RolesGuard } from 'src/roles/roles.guard';
import { AuthGuard} from 'src/auth/guard/auth.guard';

@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Post('create')
  @HttpCode(HttpStatus.CREATED)
  @Roles(Role.Admin)
  @UseGuards(AuthGuard, RolesGuard)
  async createPost(@Body() data: CreatePostDto) {
    const post = await this.postService.createPost(data);
    return post;
  }
}
