import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { PostStatus } from '../enums';

export class ImageDto {
  @IsString()
  @IsOptional()
  secure_url?: string;

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
  @IsNotEmpty()
  content!: string[];

  @IsOptional()
  @ValidateNested()
  @Type(() => ImageDto)
  image?: ImageDto;

  @IsString()
  @IsNotEmpty()
  category!: string;

  @IsEnum(PostStatus)
  @IsOptional()
  status?: PostStatus = PostStatus.PUBLISHED;

  @IsArray()
  @IsOptional()
  tags?: string[];
}
