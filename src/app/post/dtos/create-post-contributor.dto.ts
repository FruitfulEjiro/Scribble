import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { ContributorRole } from 'src/lib/enums';

export class CreatePostContributor {
  @IsString()
  @IsNotEmpty()
  userId!: string;

  @IsString()
  @IsNotEmpty()
  postId!: string;

  @IsEnum(ContributorRole)
  @IsOptional()
  role?: ContributorRole = ContributorRole.editor;

  @IsDateString()
  @IsNotEmpty()
  invitedAt!: Date;
}
