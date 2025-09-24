import {
    ArrayNotEmpty,
    IsArray,
    IsEnum,
    IsNotEmpty,
    IsString,
  } from 'class-validator';
  
  enum PostType {
    REGULAR = 'regular',
    GROUP = 'group',
  }
  
  class SaveDraftDto {
    @IsNotEmpty({ message: 'title is required' })
    @IsString({ message: 'title must be a string' })
    title?: string;
  
    @IsNotEmpty({ message: 'content is required' })
    @IsString({ message: 'content must be a string' })
    content?: string;
  
    @IsNotEmpty({ message: 'type is required' })
    @IsString({ message: 'type must be a string' })
    @IsEnum(PostType, { message: 'type must be either regular or group' })
    type?: PostType;
  
    @IsNotEmpty({ message: 'category is required' })
    @IsString({ message: 'category must be a string' })
    category?: string;
  
    @IsArray({ message: 'tags must be an array' })
    @IsString({ each: true, message: 'each tag must be a string' })
    @ArrayNotEmpty({ message: 'tag array should contain atleast 1 tag' })
    tags?: string[];
  }
  
  export default SaveDraftDto;
  