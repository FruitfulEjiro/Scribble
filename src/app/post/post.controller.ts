import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { PostService } from './post.service';
import { CurrentUser, Public } from '../../lib/decorators';
import { AuthenticatedUser } from 'src/lib/types/auth.types';
import { CreatePostDto, EditPostDto, ImageDto } from './dtos';
import { FilterDto } from 'src/lib/dtos';
import { MediaService } from 'src/shared/media';
import { PostExistPipe } from 'src/lib/pipes';
import { PostOwnerGuard } from 'src/lib/guards';
import { Post as PostObj } from 'generated/prisma/client';

@Controller('/posts')
export class PostController {
  constructor(
    private readonly postService: PostService,
    private readonly mediaService: MediaService,
  ) {}

  @Post('/create')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('coverImage', { storage: memoryStorage() }))
  async createPost(
    @CurrentUser() user: AuthenticatedUser,
    @UploadedFile() coverImage: Express.Multer.File,
    @Body() data: CreatePostDto,
  ) {
    let image: ImageDto | undefined;
    if (coverImage) {
      image = await this.mediaService.uploadFile(coverImage);
    }
    const post = await this.postService.create(
      {
        ...data,
        coverImage: {
          secure_url: image?.secure_url || '',
          public_id: image?.public_id || '',
        },
      },
      user,
    );

    return {
      status: true,
      message: 'post created successfully',
      data: post,
    };
  }

  @Public()
  @Get('')
  @HttpCode(HttpStatus.OK)
  async getAllPosts(@Query() filter: FilterDto) {
    const posts = await this.postService.findPaginatedPosts(filter);

    return {
      status: true,
      message: 'posts retrieved successfully',
      data: posts,
    };
  }

  @Public()
  @Get('/:id')
  @HttpCode(HttpStatus.OK)
  async getPostById(@Param('id', PostExistPipe) { id }: PostObj) {
    const post = await this.postService.findPostById(id);

    return {
      status: true,
      message: 'post retrieved syccessfully',
      data: post,
    };
  }

  @Delete('/delete/:id')
  @UseGuards(PostOwnerGuard)
  @HttpCode(HttpStatus.OK)
  async deletePost(@Param('id') id: string) {
    await this.postService.deletePost(id);

    return {
      status: true,
      message: 'post deleted successfully',
    };
  }

  @Patch('edit/:id')
  @UseGuards(PostOwnerGuard)
  @HttpCode(HttpStatus.OK)
  async editPost(@Param('id') id: string, @Body() data: EditPostDto) {
    const post = await this.postService.editPost(id, data);

    return {
      status: true,
      message: 'post edited successfully',
      data: post,
    };
  }
}
