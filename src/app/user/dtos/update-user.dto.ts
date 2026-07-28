import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class SocialLinksDto {
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  github?: string;

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  x?: string;

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  linkedin?: string;

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  website?: string;

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  behance?: string;
}

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  firstname?: string;

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  lastname?: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  bio?: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  location?: string;

  @Type(() => SocialLinksDto)
  @ValidateNested()
  @IsOptional()
  socialLinks?: SocialLinksDto;
}
