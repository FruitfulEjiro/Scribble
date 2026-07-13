import { Injectable } from '@nestjs/common';
import { Prisma, User } from 'generated/prisma/client';
import { PrismaService } from 'src/lib/database';
import { BaseRepository } from 'src/lib/repositories';

@Injectable()
export class AuthRepo extends BaseRepository<
  User,
  Prisma.UserCreateInput,
  Prisma.UserWhereInput,
  Prisma.UserUpdateInput
> {
  constructor(private readonly prisma: PrismaService) {
    super(prisma.user);
  }

  async findByEmail(email: string) {
    return this.model.findFirst({ where: { email } });
  }

  async updateByEmail(email: string, data: Record<string, any>) {
    return this.model.update({
      where: { email },
      data,
    });
  }
}
