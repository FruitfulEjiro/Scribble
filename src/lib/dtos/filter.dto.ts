import { IsArray, IsEnum, IsOptional, IsString } from 'class-validator';
import { PaginationDto } from './pagination.dto';
import { Transform } from 'class-transformer';
import { Category } from 'src/app/post/enums';

export class FilterDto extends PaginationDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => {
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') return value.split(',');
    return [];
  })
  tags?: string[];

  @IsOptional()
  @IsEnum(Category)
  category?: Category;
}
