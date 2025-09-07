import { IsNotEmpty, IsString } from 'class-validator';
import { DEFAULT_MIN_VERSION } from 'tls';

class UpdateUserDto {
  @IsNotEmpty({ message: 'firstname is required' })
  @IsString({ message: 'firstname must be a string' })
  firstname?: string;

  @IsNotEmpty({ message: 'lastname is required' })
  @IsString({ message: 'lastname must be a string' })
  lastname?: string;

  @IsNotEmpty({ message: 'username is required' })
  @IsString({ message: 'username must be a string' })
  username?: string;
}

export default UpdateUserDto;