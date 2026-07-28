import {
  ArgumentMetadata,
  Injectable,
  NotFoundException,
  PipeTransform,
} from '@nestjs/common';
import { PrismaService } from 'src/shared/database';

@Injectable()
export class PostExistPipe implements PipeTransform {
  constructor(private readonly prisma: PrismaService) {}

  async transform(value: any, metadata: ArgumentMetadata) {
    if (metadata.type !== 'param') return value;
    const post = await this.prisma.post.findUnique({ where: { id: value } });
    if (!post) throw new NotFoundException("post doesn't exist");

    return post.id;
  }
}
