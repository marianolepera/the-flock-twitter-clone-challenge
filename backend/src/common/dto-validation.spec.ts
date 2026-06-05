import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { LoginDto } from '../auth/dto/login.dto';
import { RegisterDto } from '../auth/dto/register.dto';
import { CreateTweetDto } from '../tweets/dto/create-tweet.dto';
import { SearchUsersDto } from '../users/dto/search-users.dto';
import { UpdateProfileDto } from '../users/dto/update-profile.dto';

async function validateDto<T extends object>(
  dtoClass: new () => T,
  plain: object,
): Promise<string[]> {
  const instance = plainToInstance(dtoClass, plain);
  const errors = await validate(instance);
  return errors.map((e) => e.property);
}

describe('DTO validation', () => {
  describe('RegisterDto', () => {
    const valid = {
      email: 'alice@example.com',
      username: 'alice',
      password: 'Password123!',
    };

    it('accepts valid registration payload', async () => {
      await expect(validateDto(RegisterDto, valid)).resolves.toEqual([]);
    });

    it('rejects invalid email', async () => {
      await expect(
        validateDto(RegisterDto, { ...valid, email: 'not-an-email' }),
      ).resolves.toContain('email');
    });

    it('rejects username shorter than 3 characters', async () => {
      await expect(
        validateDto(RegisterDto, { ...valid, username: 'ab' }),
      ).resolves.toContain('username');
    });

    it('rejects username with invalid characters', async () => {
      await expect(
        validateDto(RegisterDto, { ...valid, username: 'bad-user' }),
      ).resolves.toContain('username');
    });

    it('rejects weak password', async () => {
      await expect(
        validateDto(RegisterDto, { ...valid, password: 'weak' }),
      ).resolves.toContain('password');
    });
  });

  describe('LoginDto', () => {
    it('accepts valid login payload', async () => {
      await expect(
        validateDto(LoginDto, {
          email: 'alice@example.com',
          password: 'Password123!',
        }),
      ).resolves.toEqual([]);
    });

    it('rejects invalid email', async () => {
      await expect(
        validateDto(LoginDto, { email: 'bad', password: 'Password123!' }),
      ).resolves.toContain('email');
    });
  });

  describe('CreateTweetDto', () => {
    it('accepts content up to 280 characters', async () => {
      await expect(
        validateDto(CreateTweetDto, { content: 'a'.repeat(280) }),
      ).resolves.toEqual([]);
    });

    it('rejects content longer than 280 characters', async () => {
      await expect(
        validateDto(CreateTweetDto, { content: 'a'.repeat(281) }),
      ).resolves.toContain('content');
    });

    it('rejects invalid parentTweetId', async () => {
      await expect(
        validateDto(CreateTweetDto, {
          content: 'reply',
          parentTweetId: 'not-a-uuid',
        }),
      ).resolves.toContain('parentTweetId');
    });

    it('accepts valid parentTweetId UUID', async () => {
      await expect(
        validateDto(CreateTweetDto, {
          content: 'reply',
          parentTweetId: '550e8400-e29b-41d4-a716-446655440000',
        }),
      ).resolves.toEqual([]);
    });
  });

  describe('SearchUsersDto', () => {
    it('accepts query with at least 3 characters', async () => {
      await expect(validateDto(SearchUsersDto, { q: 'ali' })).resolves.toEqual(
        [],
      );
    });

    it('rejects query shorter than 3 characters', async () => {
      await expect(validateDto(SearchUsersDto, { q: 'ab' })).resolves.toContain(
        'q',
      );
    });
  });

  describe('UpdateProfileDto', () => {
    it('accepts partial profile updates', async () => {
      await expect(
        validateDto(UpdateProfileDto, { bio: 'New bio' }),
      ).resolves.toEqual([]);
    });

    it('rejects bio longer than 160 characters', async () => {
      await expect(
        validateDto(UpdateProfileDto, { bio: 'a'.repeat(161) }),
      ).resolves.toContain('bio');
    });

    it('rejects empty currentPassword when setting newPassword', async () => {
      await expect(
        validateDto(UpdateProfileDto, {
          newPassword: 'NewPassword1!',
          currentPassword: '',
        }),
      ).resolves.toContain('currentPassword');
    });

    it('accepts password change with currentPassword', async () => {
      await expect(
        validateDto(UpdateProfileDto, {
          currentPassword: 'Password123!',
          newPassword: 'NewPassword1!',
        }),
      ).resolves.toEqual([]);
    });
  });
});
