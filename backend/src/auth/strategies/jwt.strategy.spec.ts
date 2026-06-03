import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
  it('validate returns user when found', async () => {
    const user = { id: 'u1' } as User;
    const userRepo = {
      findOne: jest.fn().mockResolvedValue(user),
    } as unknown as Repository<User>;

    const configService = {
      getOrThrow: jest.fn().mockReturnValue('secret'),
    } as unknown as ConfigService;

    const strategy = new JwtStrategy(configService, userRepo);

    await expect(
      strategy.validate({ sub: 'u1', email: 'a@a.com', username: 'alice' }),
    ).resolves.toBe(user);
  });

  it('validate throws when user not found', async () => {
    const userRepo = {
      findOne: jest.fn().mockResolvedValue(null),
    } as unknown as Repository<User>;

    const configService = {
      getOrThrow: jest.fn().mockReturnValue('secret'),
    } as unknown as ConfigService;

    const strategy = new JwtStrategy(configService, userRepo);

    await expect(
      strategy.validate({
        sub: 'missing',
        email: 'a@a.com',
        username: 'alice',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
