import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { PrismaService } from 'src/shared/database';

export class PostInviterGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const inviteId = request.params.id;

    const invite = await this.prisma.invites.findUnique({
      where: { id: inviteId },
    });

    if (!invite) throw new NotFoundException("invite doesn't exist");

    if (invite.invitedById !== user.id)
      throw new ForbiddenException(
        'only the invite owner can perfor this action',
      );

    return true;
  }
}
