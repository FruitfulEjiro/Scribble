import {
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

class UpdatePasswordDto {
  @IsString()
  @IsNotEmpty({ message: 'password must notbe empty' })
  @MinLength(8, { message: 'password should be atleast 8 characters' })
  @MaxLength(32, { message: 'password should not be mor than 32 characters' })
  password: string;
  
  @IsString()
  @IsNotEmpty({ message: 'newPassword must notbe empty' })
  @MinLength(8, { message: 'newPassword should be atleast 8 characters' })
  @MaxLength(32, { message: 'newPassword should not be mor than 32 characters' })
  newPassword: string;
}

export default UpdatePasswordDto;