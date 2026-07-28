import { Injectable } from '@nestjs/common';
import { PaginatedResult, PaginationDto, SearchOptions } from '../dtos';

interface PrismaDelegate<T, CreateInput, WhereInput, UpdateInput> {
  create(args: { data: CreateInput }): Promise<T>;
  findMany(args?: any): Promise<T[]>;
  findFirst(args?: any): Promise<T | null>;
  findUnique(args: { where: any }): Promise<T | null>;
  update(args: { where: any; data: UpdateInput }): Promise<T>;
  delete(args: { where: any }): Promise<T>;
  count(args?: { where?: WhereInput }): Promise<number>;
}

@Injectable()
export abstract class BaseRepository<
  T,
  CreateInput = any,
  WhereInput extends Record<string, any> = any,
  UpdateInput = any,
> {
  protected constructor(
    protected readonly model: PrismaDelegate<
      T,
      CreateInput,
      WhereInput,
      UpdateInput
    >,
  ) {}

  async create(data: CreateInput): Promise<T> {
    return await this.model.create({ data });
  }

  async findOne(filter: WhereInput): Promise<T | null> {
    return await this.model.findFirst({ where: filter });
  }

  async findAll(filter?: WhereInput): Promise<T[] | null> {
    return await this.model.findMany({ where: filter });
  }

  async findPaginated(
    filter?: WhereInput,
    options?: SearchOptions,
  ): Promise<PaginatedResult<T>> {
    const page = options!.page || 1;
    const limit = options!.limit || 10;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.model.findMany({
        where: filter,
        skip,
        take: +limit,
        orderBy: options?.sort || { createdAt: 'desc' },
      }),
      this.model.count({ where: filter! }),
    ]);

    return {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      data,
    };
  }

  async findById(id: string): Promise<T | null> {
    return await this.model.findUnique({ where: { id } });
  }

  async update(id: string, data: UpdateInput): Promise<T | null> {
    try {
      return await this.model.update({ where: { id }, data });
    } catch {
      return null;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await this.model.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  }

  async count(filter: WhereInput): Promise<number> {
    return await this.model.count({ where: filter });
  }
}
