import { Injectable } from '@nestjs/common';
import PrismaService from 'src/prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async findUserById(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) return null;
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
