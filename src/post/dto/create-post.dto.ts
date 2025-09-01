import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

class CreatePostDto {
  @IsNotEmpty({ message: 'author is required' })
  @IsString({ message: 'author must be a string' })
  author: string;

  @IsNotEmpty({ message: 'title is required' })
  @IsString({ message: 'title must be a string' })
  title: string;

  @IsNotEmpty({ message: 'content is required' })
  @IsString({ message: 'content must be a string' })
  content: string;
}

export default CreatePostDto;