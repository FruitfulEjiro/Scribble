import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { CreatePostDto, EditPostDto } from './dtos';
import { PostHelper } from './helper';
import { PostRepo } from './repository/post.repository';
import { AuthenticatedUser } from 'src/lib/types/auth.types';
import { PostStatus } from './enums';
import { FilterDto } from 'src/lib/dtos';
import { MediaService } from 'src/shared/media';

@Injectable()
export class PostService {
  private readonly logger = new Logger(PostService.name);
  constructor(
    private readonly helper: PostHelper,
    private readonly postRepo: PostRepo,
    private readonly mediaService: MediaService,
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

    if (!post) throw new InternalServerErrorException('failed to create post');

    return post;
  }

  async findPostById(id: string) {
    const post = await this.postRepo.findById(id);

    return post;
  }

  async findPaginatedPosts(filter: FilterDto) {
    const post = await this.postRepo.searchPaginated(filter);
    return post;
  }

  async deletePost(id: string) {
    const post = await this.postRepo.findById(id);

    // delete cloudinary image
    if (post?.coverImage && post.coverImage.public_id) {
      await this.mediaService.deleteImage(post.coverImage.public_id!);
    }
    // delete post
    await this.postRepo.delete(id);
  }

  async editPost(id: string, data: EditPostDto) {
    const updatedPost = await this.postRepo.editPost(id, data);
  }
}
