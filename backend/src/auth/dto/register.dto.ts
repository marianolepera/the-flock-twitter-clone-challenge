import { IsEmail, IsString, Length, Matches } from 'class-validator';
import { IsPassword } from '../../common/password.validation';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @Length(3, 30)
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: 'username can only contain letters, numbers and underscores',
  })
  username: string;

  @IsPassword()
  password: string;
}
