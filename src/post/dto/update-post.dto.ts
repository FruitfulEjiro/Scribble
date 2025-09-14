import { IsNotEmpty, IsString } from 'class-validator';

class UpdatePostDto {
  @IsString({ message: 'title must be a string' })
  @IsNotEmpty({ message: ' title is required' })
  title: string;

  @IsString({ message: 'content must be a string' })
  @IsNotEmpty({ message: ' content is required' })
  content: string;
}

export default UpdatePostDto;
