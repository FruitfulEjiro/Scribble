import { Injectable } from '@nestjs/common';
import { Invites, Prisma } from 'generated/prisma/client';
import { CreatePostContributor } from 'src/app/post/dtos';
import { BaseRepository } from 'src/lib/repositories';
import { PrismaService } from 'src/shared/database';

@Injectable()
export class InviteRepo extends BaseRepository<
  Invites,
  Prisma.InvitesCreateInput,
  Prisma.InvitesWhereInput,
  Prisma.InvitesUpdateInput
> {
  constructor(private readonly prisma: PrismaService) {
    super(prisma.invites);
  }

  async getInvitedUser(email: string) {
    return await this.prisma.user.findUnique({ where: { email } });
  }

  async getPostContributor(postId: string, userId: string) {
    return await this.prisma.postContributors.findUnique({
      where: { userId_postId: { userId, postId } },
      include: {
        contributor: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        post: {
          select: {
            id: true,
            title: true,
            author: {
              select: {
                id: true,
                username: true,
              },
            },
          },
        },
      },
    });
  }

  async createContributor(data: CreatePostContributor) {
    await this.prisma.postContributors.create({
      data: {
        post: {
          connect: {
            id: data.postId,
          },
        },
        contributor: {
          connect: {
            id: data.userId,
          },
        },
        role: data.role,
        invitedAt: data.invitedAt,
      },
    });
  }

  async getPost(id: string) {
    return this.prisma.post.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
    });
  }

  async updatePostContributor(id: string, data: Record<string, any>) {
    return this.prisma.postContributors.update({ where: { id }, data });
  }
}
