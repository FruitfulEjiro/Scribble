import { ArrayNotEmpty, IsArray, IsNotEmpty, IsString } from 'class-validator';

class CreateGroupPostDto {
  @IsNotEmpty({ message: 'title is require' })
  @IsString({ message: 'title must be a string' })
  title: string;

  @IsNotEmpty({ message: 'content is require' })
  @IsString({ message: 'content must be a string' })
  content: string;

  @IsNotEmpty({ message: 'category is require' })
  @IsString({ message: 'category must be a string' })
  category: string;

  @ArrayNotEmpty({ message: 'tags is required' })
  @IsArray({ message: 'tags must be an array' })
  @IsString({ each: true, message: 'each tag must be a string' })
  tags: string[];
}
