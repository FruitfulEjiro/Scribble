import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

class LoginDto {
  @IsNotEmpty({ message: 'email is required' })
  @IsString({ message: 'email must be a string' })
  @IsEmail({}, { message: 'invalid email' })
  @Transform(({ value }) => value.toLowerCase())
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'password must notbe empty' })
  @MinLength(8, { message: 'password should be atleast 8 characters' })
  @MaxLength(32, { message: 'password should not be mor than 32 characters' })
  password: string;
}

export default LoginDto;