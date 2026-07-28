import { IsEmail, IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
import { ContributorRole } from 'src/lib/enums';

export class CreateInviteDto {
  @IsNotEmpty()
  @IsEmail()
  email!: string;

  @IsEnum(ContributorRole)
  @IsOptional()
  role?: ContributorRole = ContributorRole.editor;
}
