import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  ValidateNested,
} from 'class-validator';
import { Category } from 'generated/prisma/enums';
import { PostStatus } from '../enums';

class ImageDto {
  @IsUrl()
  @IsOptional()
  secure_url?: string;

  @IsString()
  @IsOptional()
  public_id?: string;
}

export class EditPostDto {
  @IsString()
  @IsNotEmpty()
  title?: string;

  @IsString()
  @IsNotEmpty()
  description?: string;

  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  @ArrayMinSize(1)
  content?: string[];

  @IsOptional()
  @ValidateNested()
  @IsOptional()
  @Type(() => ImageDto)
  coverImage?: ImageDto;

  @IsEnum(Category)
  @IsOptional()
  category?: Category;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @IsInt()
  @IsNotEmpty()
  version!: number;
}
