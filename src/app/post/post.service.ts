import { Injectable, Logger } from '@nestjs/common';
import { CreatePostDto } from './dtos';
import { PostHelper } from './helper';
import { PostRepo } from './repository/post.repository';
import { AuthenticatedUser } from 'src/lib/types/auth.types';
import { PostStatus } from './enums';
import { FilterDto, PaginationDto } from 'src/lib/dtos';

@Injectable()
export class PostService {
  private readonly logger = new Logger(PostService.name);
  constructor(
    private readonly helper: PostHelper,
    private readonly postRepo: PostRepo,
  ) {}

  async create(data: CreatePostDto, user: AuthenticatedUser) {
    const readTime = this.helper.calculateReadTime(data.content);
    const publishedAt =
      data.status === PostStatus.PUBLISHED ? new Date() : null;

    const post = await this.postRepo
      .create({
        ...data,
        readTime,
        publishedAt,
        author: {
          connect: {
            id: user.id,
          },
        },
      })
      .then((data) => {
        this.logger.log('post created successfully');
        return data;
      });

    return post;
  }

  async findPostById(id: string) {
    const post = await this.postRepo.findById(id);

    return post;
  }

  async findPaginatedPosts(filter: FilterDto, options?: PaginationDto) {
    const post = await this.postRepo.searchPaginated(filter, options);
    return post;
  }
}
