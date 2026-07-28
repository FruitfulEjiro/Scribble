import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/shared/database';

@Injectable()
export class PostContributorGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const token = request.query.token;

    if (!user) throw new UnauthorizedException('not authenticated');
    if (!token) throw new BadRequestException('token is invalid');

    const postContributor = await this.prisma.postContributors.findFirst({
      where: { userId: user.id },
    });
    if (!postContributor)
      throw new ForbiddenException('you were not invited to this post');

    return true;
  }
}
