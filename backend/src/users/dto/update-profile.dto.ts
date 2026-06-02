import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Length,
  Matches,
  MaxLength,
  ValidateIf,
} from 'class-validator';
import { IsPassword } from '../../common/password.validation';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @Length(3, 30)
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: 'username can only contain letters, numbers and underscores',
  })
  username?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  bio?: string;

  @IsOptional()
  @IsUrl()
  avatarUrl?: string;

  @IsOptional()
  @IsString()
  @ValidateIf((dto: UpdateProfileDto) => dto.newPassword !== undefined)
  @IsNotEmpty({
    message: 'currentPassword is required when changing password',
  })
  currentPassword?: string;

  @IsOptional()
  @IsPassword()
  newPassword?: string;
}
