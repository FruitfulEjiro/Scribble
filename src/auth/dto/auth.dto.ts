import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class authDto {
  @IsNotEmpty({ message: 'Firstname must not be enpty' })
  @IsString({ message: 'Firstname must be a string' })
  @MinLength(3, { message: 'Firstname must be atleast 3 characters' })
  @MaxLength(32, { message: 'Firstname must not be more than 32 characters' })
  firstname: string;
}
