import { IsOptional, IsString } from 'class-validator';
import { PaginationDto } from './pagination.dto';

export class FilterDto extends PaginationDto {
  @IsOptional()
  @IsString()
  search?: string;
}

export type FilterQuery<T> = Record<string, unknown>;
