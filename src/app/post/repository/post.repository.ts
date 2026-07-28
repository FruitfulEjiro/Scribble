import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Post, Prisma } from 'generated/prisma/client';
import { PrismaService } from 'src/shared/database';
import { BaseRepository } from 'src/lib/repositories';
import { FilterDto, SearchOptions } from 'src/lib/dtos';
import { PostStatus } from '../enums';
import { EditPostDto } from '../dtos';

@Injectable()
export class PostRepo extends BaseRepository<
  Post,
  Prisma.PostCreateInput,
  Prisma.PostWhereInput,
  Prisma.PostUpdateInput
> {
  constructor(private readonly prisma: PrismaService) {
    super(prisma.post);
  }

  async searchPaginated(filter: FilterDto) {
    const where: Prisma.PostWhereInput = {
      status: PostStatus.PUBLISHED,
    };
    const searchOptions: SearchOptions = {
      page: filter.page,
      limit: filter.limit,
      sort: filter.sort,
    };

    const trimmedSearch = filter.search?.trim();
    const tags = filter.tags;
    const category = filter.category;

    const andConditions: Prisma.PostWhereInput[] = [];

    const searchTerms = trimmedSearch?.split(/\s+/);
    const formattedSearch = searchTerms?.join(' | ');
    if (trimmedSearch) {
      andConditions.push({
        OR: [
          { title: { search: formattedSearch } },
          { description: { search: formattedSearch } },
          { tags: { hasSome: searchTerms } },
        ],
      });
    }

    if (tags && tags.length > 0) {
      andConditions.push({ tags: { hasSome: tags } });
    }

    if (category) {
      andConditions.push({ category });
    }

    if (andConditions.length > 0) {
      where.AND = andConditions;
    }

    // Only default to relevance sort if the user didn't request a specific sort,
    // and only one "search-like" filter is active (relevance across mixed
    // filters doesn't compose cleanly — pick a sensible precedence).
    if (!filter.sort) {
      if (trimmedSearch) {
        searchOptions.sort = {
          _relevance: {
            fields: ['title', 'description'],
            search: formattedSearch!,
            sort: 'desc',
          },
        };
      } else if (tags && tags.length > 0) {
        searchOptions.sort = {
          _relevance: {
            fields: ['tags'],
            search: tags.join(' | '),
            sort: 'desc',
          },
        };
      }
    }

    return this.findPaginated(where, searchOptions);
  }

  async editPost(id: string, dataObj: EditPostDto) {
    const { version, ...data } = dataObj;

    const result = await this.prisma.post.updateMany({
      where: { id, version },
      data: {
        ...data,
        version: {
          increment: 1,
        },
      },
    });

    if (result.count === 0) {
      // post has been edited by another person
      const current = await this.model.findUnique({ where: { id } });
      if (!current) throw new NotFoundException();
      throw new ConflictException({
        message: 'Article was modified by someone else since you loaded it.',
        currentVersion: current.version,
        currentContent: {
          title: current.title,
          description: current.description,
          content: current.content,
          coverImage: current.coverImage,
          tags: current.tags,
          category: current.category,
          version: current.version,
          updatedAt: current.updatedAt,
        },
      });
    }

    return await this.model.findUnique({ where: { id } });
  }
}
