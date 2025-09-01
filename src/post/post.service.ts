import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import PrismaService from 'src/prisma/prisma.service';

@Injectable()
export class PostService {
  constructor(private readonly prisma: PrismaService) {}

  async createPost(data: Prisma.PostCreateInput) {
    const post = await this.prisma.post.create({ data: data });
    if (!post) throw new InternalServerErrorException('failed to create post');

    return post;
  }
}
