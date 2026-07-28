import { Injectable } from '@nestjs/common';
import { Prisma, User } from 'generated/prisma/client';
import { BaseRepository } from 'src/lib/repositories';
import { PrismaService } from 'src/shared/database';
import { UpdateUserDto } from '../dtos';

@Injectable()
export class UserRepo extends BaseRepository<
  User,
  Prisma.UserCreateInput,
  Prisma.UserWhereInput,
  Prisma.UserUpdateInput
> {
  constructor(private readonly prisma: PrismaService) {
    super(prisma.user);
  }

  async updateUserAndProfile(
    userId: string,
    userData: Record<string, any>,
    profileData: Record<string, any>,
    socialLinksPatch?: Record<string, string>,
  ) {
    return this.prisma.$transaction(async (tx) => {
      let user;
      let profile;

      if (Object.keys(userData).length) {
        user = await tx.user.update({ where: { id: userId }, data: userData });
      }

      if (socialLinksPatch) {
        const current = await tx.profile.findUnique({
          where: { userId },
          select: { socialLinks: true },
        });
        profileData.socialLinks = {
          ...((current?.socialLinks as object) ?? {}),
          ...socialLinksPatch,
        };
      }

      if (Object.keys(profileData).length) {
        profile = await tx.profile.update({
          where: { userId },
          data: profileData,
        });
      }

      return { user, profile };
    });
  }

  // user.repository.ts
  async getSocialLinks(userId: string): Promise<Record<string, string> | null> {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      select: { socialLinks: true },
    });
    return (profile?.socialLinks as Record<string, string>) ?? null;
  }

  async getUserWithProfile(userId: string) {
    return await this.prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });
  }
}
