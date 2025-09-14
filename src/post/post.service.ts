import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import PrismaService from 'src/prisma/prisma.service';
import { IPost } from './interface/post.interface';

@Injectable()
export class PostService {
  constructor(private readonly prisma: PrismaService) {}

  async createPost(data: Prisma.PostUncheckedCreateInput): Promise<IPost> {
    const post = await this.prisma.post.create({ data });
    if (!post) throw new InternalServerErrorException('failed to create post');

    return <IPost>post;
  }

  async findPostById(postId: string): Promise<IPost> {
    const post = await this.prisma.post.findUnique({ where: { id: postId, status: "published" } });
    if (!post) throw new NotFoundException('post not found');

    return <IPost>post;
  }

  async findPostByUserId(userId: string): Promise<IPost[]> {
    const posts = await this.prisma.post.findMany({
      where: { authorId: userId },
    });
    if (!posts) throw new NotFoundException('no posts found');

    return <IPost[]>posts;
  }

  async updatePost(
    userId: string,
    postId: string,
    data: Prisma.PostUpdateInput,
  ): Promise<IPost> {
    const updatePost = await this.prisma.post.update({
      where: { id: postId, authorId: userId },
      data: data,
    });
    if (!updatePost) throw new NotFoundException('post not found');

    return <IPost>updatePost;
  }

  async saveDraft(data: Prisma.PostUncheckedCreateInput): Promise<IPost> {
    const post = await this.prisma.post.create({ data });
    if (!post) throw new InternalServerErrorException('failed to create post');

    return <IPost>post;
  }

  async getDraftById(postId: string): Promise<IPost> {
    const post = await this.prisma.post.findUnique({ where: { id: postId, status: "draft" } });
    if (!post) throw new NotFoundException('post not found');

    return <IPost>post;
  }

  async getUserDrafts(userId: string): Promise<IPost[]> {
    const drafts = await this.prisma.post.findMany({
      where: { authorId: userId, status: 'draft' },
    });
    if (!drafts) throw new NotFoundException('no drafts found');

    return <IPost[]>drafts;
  }

  async deletePost(postId: string, userId: string): Promise<{}> {
    const deletePost = await this.prisma.post.delete({
      where: { id: postId, authorId: userId },
    });
    if (!deletePost) throw new NotFoundException('post not found');

    return { message: 'post deleted successfully' };
  }
}
