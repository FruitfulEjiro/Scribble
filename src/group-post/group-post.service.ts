import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import PrismaService from 'src/prisma/prisma.service';

@Injectable()
export class GroupPostService {
  constructor(private readonly prisma: PrismaService) {}

  async createGroupPost(data: Prisma.GroupPostUncheckedCreateInput) {
    const groupPost = await this.prisma.groupPost.create({ data });
    if (!groupPost) throw new InternalServerErrorException("failed to create grop post")
  }
}
