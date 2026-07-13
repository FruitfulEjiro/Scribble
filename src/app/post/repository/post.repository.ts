import { Injectable } from '@nestjs/common';
import { Post, Prisma } from 'generated/prisma/client';
import { PrismaService } from 'src/lib/database';
import { BaseRepository } from 'src/lib/repositories';
import { FilterDto, PaginationDto } from 'src/lib/dtos';

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

  async searchPaginated(filter: FilterDto, options?: PaginationDto) {
    const where: Prisma.PostWhereInput = {};
    const searchOptions: any = { ...options };

    if (filter.search) {
      const formattedSearch = filter.search.trim().split(/\s+/).join(' | ');

      where.OR = [
        { title: { search: formattedSearch } },
        { description: { search: formattedSearch } },
        { tags: { has: filter.search } },
      ];

      // Sort by relevance score on title and description
      searchOptions.sort = {
        _relevance: {
          fields: ['title', 'description'],
          search: formattedSearch,
          sort: 'desc',
        },
      };
    }

    return this.findPaginated(where, searchOptions);
  }
}
