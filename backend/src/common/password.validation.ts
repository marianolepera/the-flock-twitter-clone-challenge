import { applyDecorators } from '@nestjs/common';
import { IsString, Length, Matches } from 'class-validator';

export const PASSWORD_REGEX =
  /^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,72}$/;

export const PASSWORD_VALIDATION_MESSAGE =
  'password must be 8–72 characters and include at least one uppercase letter and one special character';

export function IsPassword() {
  return applyDecorators(
    IsString(),
    Length(8, 72),
    Matches(PASSWORD_REGEX, { message: PASSWORD_VALIDATION_MESSAGE }),
  );
}
