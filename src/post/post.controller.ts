import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
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
import SaveDraftDto from './dto/save-draft.dto';

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

  @Post('invite/:id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard, PostOwnerGuard)
  async inviteContributor(
    @Param('id', PostExistsPipe) id: string,
    @Body('email') email: string,
  ) {
    const invite = await this.postService.inviteContributor(email, id);
    return invite;
  }

  @Get('get/:id')
  @HttpCode(HttpStatus.OK)
  async getPostById(@Param('id', PostExistsPipe) id: string) {
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
  @UseGuards(AuthGuard, PostOwnerGuard)
  async updatePost(
    @Request() req,
    @Param('id', PostExistsPipe) id: string,
    @Body() data: UpdatePostDto,
  ) {
    const updatePost = await this.postService.updatePost(req.user.id, id, data);
    return updatePost;
  }

  @Post('save-draft')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  async saveDraft(@Request() req, @Body() data: SaveDraftDto) {
    const post = await this.postService.saveDraft({
      authorId: req.user.id,
      title: data.title || 'Untitled',
      content: data.content || '',
      type: data.type || 'regular',
      category: data.category || 'Uncategorized',
      tags: data.tags || [],
      status: 'draft',
    });
    return post;
  }

  @Post('publish-draft/:id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard, PostOwnerGuard)
  async publishDraft(
    @Param('id', PostExistsPipe) id: string,
    @Request() req,
    @Body() data: SaveDraftDto,
  ) {
    const post = await this.postService.publishDraft(id, {
      title: data.title || 'Untitled',
      content: data.content || '',
      type: data.type || 'regular',
      category: data.category || 'Uncategorized',
      tags: data.tags || [],
      status: 'draft',
    });
    return post;
  }

  @Get('draft/:id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard, PostOwnerGuard)
  async getDraftById(@Param('id', PostExistsPipe) id: string) {
    const draft = await this.postService.getDraftById(id);
    return draft;
  }

  @Get('get-user-drafts')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  async getUserDrafts(@Request() req) {
    const drafts = await this.postService.getUserDrafts(req.user.id);
    return drafts;
  }

  @Get('search')
  @HttpCode(HttpStatus.OK)
  async searchPosts(
    @Query('search') search: string,
    @Query('page', ParseIntPipe) page: number,
    @Query('limit', ParseIntPipe) limit: number,
  ) {
    const posts = await this.postService.searchPosts(search, page, limit);
    return posts;
  }

  @Get(":id/collaborators")
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard, PostOwnerGuard)
  async getPostCollaborators(@Param('id', PostExistsPipe) id: string) {
    const collaborators = await this.postService.getPostCollaborators(id);
    return collaborators;
  }

  @Delete('delete/:id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  async deletePost(@Request() req, @Param('id', PostExistsPipe) id: string) {
    const deletePost = await this.postService.deletePost(id, req.user.id);
    return deletePost;
  }
}
