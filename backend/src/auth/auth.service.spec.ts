import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { AuthService } from './auth.service';
import { RefreshToken } from './entities/refresh-token.entity';
import { User } from '../users/entities/user.entity';

type MockRepo<T extends object> = Partial<
  Record<keyof Repository<T>, jest.Mock>
>;

function mockRepo<T extends object>(): MockRepo<T> {
  return {
    findOne: jest.fn(),
    findOneOrFail: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    createQueryBuilder: jest.fn(),
  };
}

describe('AuthService', () => {
  let service: AuthService;
  let userRepo: MockRepo<User>;
  let refreshRepo: MockRepo<RefreshToken>;
  let jwtService: JwtService;
  let configService: ConfigService;

  beforeEach(() => {
    userRepo = mockRepo<User>();
    refreshRepo = mockRepo<RefreshToken>();

    jwtService = {
      sign: jest.fn(() => 'signed'),
      verify: jest.fn(),
    } as unknown as JwtService;

    configService = {
      getOrThrow: jest.fn((key: string) => {
        if (key === 'JWT_ACCESS_SECRET') return 'access';
        if (key === 'JWT_REFRESH_SECRET') return 'refresh';
        throw new Error(`Missing ${key}`);
      }),
      get: jest.fn((key: string) => {
        if (key === 'JWT_ACCESS_TTL') return '15m';
        if (key === 'JWT_REFRESH_TTL') return '7d';
        return undefined;
      }),
    } as unknown as ConfigService;

    service = new AuthService(
      userRepo as unknown as Repository<User>,
      refreshRepo as unknown as Repository<RefreshToken>,
      jwtService,
      configService,
    );
  });

  it('register throws ConflictException when email/username exists', async () => {
    (userRepo.findOne as jest.Mock).mockResolvedValue({ id: 'u1' });

    await expect(
      service.register({
        email: 'a@a.com',
        username: 'alice',
        password: 'Password123!',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('login throws UnauthorizedException for invalid credentials', async () => {
    (userRepo.findOne as jest.Mock).mockResolvedValue(null);

    await expect(
      service.login({ email: 'a@a.com', password: 'bad' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('login returns token pair for valid credentials', async () => {
    const passwordHash = await bcrypt.hash('Password123!', 10);
    (userRepo.findOne as jest.Mock).mockResolvedValue({
      id: 'u1',
      email: 'a@a.com',
      username: 'alice',
      bio: '',
      avatarUrl: '',
      createdAt: new Date(),
      updatedAt: new Date(),
      passwordHash,
    });
    (refreshRepo.create as jest.Mock).mockImplementation((x) => x);
    (refreshRepo.save as jest.Mock).mockImplementation((x) => ({
      ...x,
      id: 'rt1',
    }));

    const res = await service.login({
      email: 'a@a.com',
      password: 'Password123!',
    });

    expect(res).toHaveProperty('accessToken');
    expect(res).toHaveProperty('refreshToken');
    expect(res).toHaveProperty('user');
    expect(res.user).toMatchObject({ id: 'u1', username: 'alice' });
  });

  it('refresh rejects invalid refresh token', async () => {
    (jwtService.verify as jest.Mock).mockImplementation(() => {
      throw new Error('bad');
    });

    await expect(service.refresh('nope')).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });
});
