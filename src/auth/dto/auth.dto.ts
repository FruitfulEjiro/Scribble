import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Transform } from 'class-transformer';

class CreateAccountDto {
  @IsNotEmpty({ message: 'firstname must not be enpty' })
  @IsString({ message: 'firstname must be a string' })
  @MinLength(3, { message: 'firstname must be atleast 3 characters' })
  @MaxLength(32, { message: 'firstname must not be more than 32 characters' })
  firstname: string;

  @IsNotEmpty({ message: 'firstname must not be enpty' })
  @IsString({ message: 'firstname must be a string' })
  @MinLength(3, { message: 'firstname must be atleast 3 characters' })
  @MaxLength(32, { message: 'firstname must not be more than 32 characters' })
  lastname: string;

  @IsNotEmpty({ message: 'username must not be enpty' })
  @IsString({ message: 'username must be a string' })
  @MinLength(3, { message: 'username must be atleast 3 characters' })
  @MaxLength(32, { message: 'username must not be more than 32 characters' })
  @Transform(({ value }) => value.toLowerCase())
  username: string;

  @IsNotEmpty({ message: 'email must not be empty' })
  @IsString({ message: 'email must be a string' })
  @IsEmail()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.toLowerCase() : value,
  )
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'password must notbe empty' })
  @MinLength(8, { message: 'password should be atleast 8 characters' })
  @MaxLength(32, { message: 'password should not be mor than 32 characters' })
  password: string;
}

export default CreateAccountDto;
