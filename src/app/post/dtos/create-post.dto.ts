import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  ValidateNested,
} from 'class-validator';
import { Category, PostStatus } from '../enums';

export class ImageDto {
  @IsUrl()
  @IsNotEmpty()
  secure_url!: string;

  @IsString()
  @IsOptional()
  public_id?: string;
}

export class CreatePostDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  content!: string[];

  @IsOptional()
  @ValidateNested()
  @Type(() => ImageDto)
  coverImage?: ImageDto;

  @IsEnum(Category)
  category!: Category;

  @IsEnum(PostStatus)
  @IsOptional()
  status?: PostStatus = PostStatus.PUBLISHED;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];
}