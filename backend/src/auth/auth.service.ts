import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import type { StringValue } from 'ms';
import { randomUUID } from 'node:crypto';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshToken } from './entities/refresh-token.entity';
import { JwtPayload } from './interfaces/jwt-payload.interface';

const BCRYPT_ROUNDS = 12;

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const exists = await this.userRepository.findOne({
      where: [{ email: dto.email }, { username: dto.username }],
    });
    if (exists) {
      throw new ConflictException('Email or username already in use');
    }

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
    const user = this.userRepository.create({
      email: dto.email,
      username: dto.username,
      passwordHash,
      avatarUrl: '',
    });
    await this.userRepository.save(user);

    return this.issueTokenPair(user);
  }

  async login(dto: LoginDto) {
    const user = await this.userRepository.findOne({
      where: { email: dto.email },
      select: {
        id: true,
        email: true,
        username: true,
        bio: true,
        avatarUrl: true,
        createdAt: true,
        updatedAt: true,
        passwordHash: true,
      },
    });

    if (!user || !(await bcrypt.compare(dto.password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.issueTokenPair(user);
  }

  async refresh(rawRefreshToken: string) {
    let payload: JwtPayload;
    try {
      payload = this.jwtService.verify<JwtPayload>(rawRefreshToken, {
        secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const stored = await this.refreshTokenRepository
      .createQueryBuilder('rt')
      .where('rt.userId = :userId', { userId: payload.sub })
      .andWhere('rt.revokedAt IS NULL')
      .andWhere('rt.expiresAt > NOW()')
      .getMany();

    const match = await this.findMatchingToken(stored, rawRefreshToken);
    if (!match) {
      await this.revokeAllForUser(payload.sub);
      throw new UnauthorizedException('Refresh token reuse detected');
    }

    const user = await this.userRepository.findOneOrFail({
      where: { id: payload.sub },
    });

    const {
      accessToken,
      refreshToken: newRefreshToken,
      refreshTokenRecord,
    } = await this.issueTokenPair(user);

    match.revokedAt = new Date();
    match.replacedByTokenId = refreshTokenRecord.id;
    await this.refreshTokenRepository.save(match);

    return { accessToken, refreshToken: newRefreshToken };
  }

  async logout(rawRefreshToken: string) {
    let payload: JwtPayload;
    try {
      payload = this.jwtService.verify<JwtPayload>(rawRefreshToken, {
        secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
        ignoreExpiration: true,
      });
    } catch {
      return;
    }

    const stored = await this.refreshTokenRepository
      .createQueryBuilder('rt')
      .where('rt.userId = :userId', { userId: payload.sub })
      .andWhere('rt.revokedAt IS NULL')
      .getMany();

    const match = await this.findMatchingToken(stored, rawRefreshToken);
    if (match) {
      match.revokedAt = new Date();
      await this.refreshTokenRepository.save(match);
    }
  }

  private async issueTokenPair(user: User) {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      username: user.username,
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
      expiresIn: (this.configService.get<string>('JWT_ACCESS_TTL') ??
        '15m') as StringValue,
    });

    const rawRefreshToken = this.jwtService.sign(payload, {
      secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
      expiresIn: (this.configService.get<string>('JWT_REFRESH_TTL') ??
        '7d') as StringValue,
      jwtid: randomUUID(),
    });

    const tokenHash = await bcrypt.hash(rawRefreshToken, BCRYPT_ROUNDS);
    const refreshTtlDays = parseInt(
      (this.configService.get<string>('JWT_REFRESH_TTL') ?? '7d').replace(
        'd',
        '',
      ),
      10,
    );
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + refreshTtlDays);

    const refreshTokenRecord = this.refreshTokenRepository.create({
      userId: user.id,
      tokenHash,
      expiresAt,
    });
    await this.refreshTokenRepository.save(refreshTokenRecord);

    const safeUser = {
      id: user.id,
      email: user.email,
      username: user.username,
      bio: user.bio,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return {
      accessToken,
      refreshToken: rawRefreshToken,
      refreshTokenRecord,
      user: safeUser,
    };
  }

  private async findMatchingToken(
    tokens: RefreshToken[],
    rawToken: string,
  ): Promise<RefreshToken | undefined> {
    for (const token of tokens) {
      const matches = await bcrypt.compare(rawToken, token.tokenHash);
      if (matches) return token;
    }
    return undefined;
  }

  private async revokeAllForUser(userId: string) {
    await this.refreshTokenRepository
      .createQueryBuilder()
      .update(RefreshToken)
      .set({ revokedAt: new Date() })
      .where('userId = :userId AND revokedAt IS NULL', { userId })
      .execute();
  }
}
