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
  Request,
  UseGuards,
} from '@nestjs/common';
import { PostService } from './post.service';
import CreatePostDto from './dto/create-post.dto';
import { Roles } from 'src/auth/decorator/roles.decorator';
import { Role } from 'src/auth/types/roles.enum';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import UpdatePostDto from './dto/update-post.dto';
import { PostExistsPipe } from './pipes/post-exists.pipe';
import { PostOwnerGuard } from './guard/post-owner.guard';

@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Post('create')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.User)
  async createPost(@Request() req, @Body() data: CreatePostDto) {
    const post = await this.postService.createPost({
      authorId: req.user.id,
      ...data,
    });
    return post;
  }

  @Post('invite')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard, PostOwnerGuard)
  async inviteContributor(
    @Param('id') id: string,
    @Body('email') email: string,
  ) {
    const invite = await this.postService.inviteContributor(email, id);
    return invite;
  }

  

  @Get('get/:id')
  @HttpCode(HttpStatus.OK)
  async getPostById(@Param('id') id: string) {
    const post = await this.postService.findPostById(id);
    return post;
  }

  @Get('/user-posts')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  async getUserPost(@Param('id') id: string) {
    const posts = await this.postService.findPostByUserId(id);
    return posts;
  }

  @Patch('update/:id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  async updatePost(
    @Request() req,
    @Param('id', PostExistsPipe) id: string,
    @Body() data: UpdatePostDto,
  ) {
    const updatePost = await this.postService.updatePost(req.user.id, id, data);
    return updatePost;
  }

  @Delete('delete/:id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  async deletePost(@Request() req, @Param('id', PostExistsPipe) id: string) {
    const deletePost = await this.postService.deletePost(id, req.user.id);
    return deletePost;
  }
}
