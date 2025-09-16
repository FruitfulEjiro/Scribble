import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import PrismaService from 'src/prisma/prisma.service';

@Injectable()
export class PostOwnerGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const postId = request.params.id;

    // fetch the post
    const post = await this.prisma.post.findUnique({
      where: { id: postId, authorId: user.id },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (post.authorId !== user.id) {
      throw new ForbiddenException('You are not the owner of this post');
    }

    return true;
  }
}
