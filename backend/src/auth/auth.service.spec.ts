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

function mockRefreshQueryBuilder(tokens: RefreshToken[]) {
  return {
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    getMany: jest.fn().mockResolvedValue(tokens),
    update: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
    execute: jest.fn().mockResolvedValue(undefined),
  };
}

const baseUser = {
  id: 'u1',
  email: 'a@a.com',
  username: 'alice',
  bio: '',
  avatarUrl: '',
  createdAt: new Date(),
  updatedAt: new Date(),
};

function mockRefreshToken(overrides: Partial<RefreshToken> = {}): RefreshToken {
  return {
    id: 'rt1',
    userId: 'u1',
    tokenHash: 'hash',
    expiresAt: new Date(Date.now() + 86400000),
    revokedAt: null,
    replacedByTokenId: null,
    createdAt: new Date(),
    user: baseUser as User,
    ...overrides,
  };
}

function setupTokenMocks(refreshRepo: MockRepo<RefreshToken>) {
  (refreshRepo.create as jest.Mock).mockImplementation((x) => x);
  (refreshRepo.save as jest.Mock).mockImplementation((x) => {
    if (!x.id) {
      x.id = 'rt-new';
    }
    return Promise.resolve(x);
  });
}

describe('AuthService', () => {
  let service: AuthService;
  let userRepo: MockRepo<User>;
  let refreshRepo: MockRepo<RefreshToken>;
  let jwtService: JwtService;
  let jwtSign: jest.Mock;
  let configService: ConfigService;

  beforeEach(() => {
    userRepo = mockRepo<User>();
    refreshRepo = mockRepo<RefreshToken>();

    jwtSign = jest.fn(() => 'signed');
    jwtService = {
      sign: jwtSign,
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

  it('login throws UnauthorizedException when password is wrong', async () => {
    const passwordHash = await bcrypt.hash('Password123!', 10);
    (userRepo.findOne as jest.Mock).mockResolvedValue({
      ...baseUser,
      passwordHash,
    });

    await expect(
      service.login({ email: 'a@a.com', password: 'Wrongpass123!' }),
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
    setupTokenMocks(refreshRepo);
    (refreshRepo.save as jest.Mock).mockImplementation((x) => {
      if (!x.id) {
        x.id = 'rt1';
      }
      return Promise.resolve(x);
    });

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

  it('register creates user and returns token pair', async () => {
    (userRepo.findOne as jest.Mock).mockResolvedValue(null);
    (userRepo.create as jest.Mock).mockImplementation((x) => x);
    (userRepo.save as jest.Mock).mockImplementation((u) =>
      Promise.resolve({ ...u, id: 'u1' }),
    );
    setupTokenMocks(refreshRepo);
    (refreshRepo.save as jest.Mock).mockImplementation((x) => {
      if (!x.id) {
        x.id = 'rt1';
      }
      return Promise.resolve(x);
    });

    const res = await service.register({
      email: 'new@a.com',
      username: 'newuser',
      password: 'Password123!',
    });

    expect(res).toHaveProperty('accessToken');
    expect(res).toHaveProperty('user.username', 'newuser');
  });

  it('logout completes without error for invalid token', async () => {
    (jwtService.verify as jest.Mock).mockImplementation(() => {
      throw new Error('bad');
    });

    await expect(service.logout('bad-token')).resolves.toBeUndefined();
  });

  it('refresh returns new token pair when refresh token is valid', async () => {
    const rawRefreshToken = 'valid-refresh-token';
    const storedToken = mockRefreshToken({
      id: 'rt-old',
      tokenHash: await bcrypt.hash(rawRefreshToken, 10),
    });

    (jwtService.verify as jest.Mock).mockReturnValue({
      sub: 'u1',
      email: 'a@a.com',
      username: 'alice',
    });
    (refreshRepo.createQueryBuilder as jest.Mock).mockReturnValue(
      mockRefreshQueryBuilder([storedToken]),
    );
    (userRepo.findOneOrFail as jest.Mock).mockResolvedValue(baseUser);
    setupTokenMocks(refreshRepo);

    const res = await service.refresh(rawRefreshToken);

    expect(res).toHaveProperty('accessToken');
    expect(res).toHaveProperty('refreshToken');
    expect(refreshRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'rt-old',
        revokedAt: expect.any(Date) as Date,
        replacedByTokenId: 'rt-new',
      }),
    );
  });

  it('refresh revokes all tokens and rejects reuse when token does not match', async () => {
    const rawRefreshToken = 'stolen-token';
    const storedToken = mockRefreshToken({
      id: 'rt-old',
      tokenHash: await bcrypt.hash('other-token', 10),
    });

    (jwtService.verify as jest.Mock).mockReturnValue({ sub: 'u1' });
    const qb = mockRefreshQueryBuilder([storedToken]);
    (refreshRepo.createQueryBuilder as jest.Mock)
      .mockReturnValueOnce(qb)
      .mockReturnValueOnce(qb);

    await expect(service.refresh(rawRefreshToken)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );

    expect(qb.execute).toHaveBeenCalled();
  });

  it('logout revokes matching refresh token', async () => {
    const rawRefreshToken = 'logout-token';
    const storedToken = mockRefreshToken({
      id: 'rt1',
      tokenHash: await bcrypt.hash(rawRefreshToken, 10),
      expiresAt: new Date(),
    });

    (jwtService.verify as jest.Mock).mockReturnValue({ sub: 'u1' });
    (refreshRepo.createQueryBuilder as jest.Mock).mockReturnValue(
      mockRefreshQueryBuilder([storedToken]),
    );

    await service.logout(rawRefreshToken);

    expect(refreshRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'rt1',
        revokedAt: expect.any(Date) as Date,
      }),
    );
  });

  it('issueTokenPair uses default TTLs when config omits JWT_*_TTL', async () => {
    const passwordHash = await bcrypt.hash('Password123!', 10);
    (userRepo.findOne as jest.Mock).mockResolvedValue({
      ...baseUser,
      passwordHash,
    });
    (configService.get as jest.Mock).mockReturnValue(undefined);
    setupTokenMocks(refreshRepo);

    await service.login({ email: 'a@a.com', password: 'Password123!' });

    expect(jwtSign).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({ expiresIn: '15m' }),
    );
    expect(jwtSign).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({ expiresIn: '7d' }),
    );
  });

  it('logout does nothing when no matching token in store', async () => {
    (jwtService.verify as jest.Mock).mockReturnValue({ sub: 'u1' });
    (refreshRepo.createQueryBuilder as jest.Mock).mockReturnValue(
      mockRefreshQueryBuilder([]),
    );

    await service.logout('unknown-token');

    expect(refreshRepo.save).not.toHaveBeenCalled();
  });
});
