import { ArrayNotEmpty, IsArray, IsNotEmpty, IsString } from 'class-validator';

class CreatePostDto {
  @IsNotEmpty({ message: 'title is required' })
  @IsString({ message: 'title must be a string' })
  title: string;

  @IsNotEmpty({ message: 'content is required' })
  @IsString({ message: 'content must be a string' })
  content: string;

  @IsNotEmpty({ message: 'category is required' })
  @IsString({ message: 'category must be a string' })
  category: string;

  @IsArray({ message: 'tags must be an array' })
  @IsString({ each: true, message: 'each tag must be a string' })
  @ArrayNotEmpty({ message: 'tag array should contain atleast 1 tag' })
  tags: string[];
}

export default CreatePostDto;
