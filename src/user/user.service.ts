import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import PrismaService from 'src/prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async findUserById(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) throw new InternalServerErrorException('failed to update user');
    return this.excludePassword(user);
  }

  async updateUser(userId: string, data: Prisma.UserUpdateInput) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data,
    });
    if (!user) throw new InternalServerErrorException('failed to update user');

    return this.excludePassword(user);
  }

  async deleteUser(userId: string): Promise<void> {
    await this.prisma.user.delete({
      where: { id: userId },
    });
  }

  private async excludePassword(user: any) {
    const { password, ...result } = user;
    return result;
  }
}
