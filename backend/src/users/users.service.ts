import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { ILike, Repository } from 'typeorm';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { User } from './entities/user.entity';

const BCRYPT_ROUNDS = 12;

const PROFILE_SELECT = {
  id: true,
  email: true,
  username: true,
  bio: true,
  avatarUrl: true,
  createdAt: true,
  updatedAt: true,
} as const;

const UPDATE_PROFILE_SELECT = {
  ...PROFILE_SELECT,
  passwordHash: true,
} as const;

export type PublicProfile = Pick<
  User,
  'id' | 'email' | 'username' | 'bio' | 'avatarUrl' | 'createdAt' | 'updatedAt'
>;

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async getProfileById(id: string): Promise<PublicProfile> {
    const user = await this.userRepository.findOne({
      where: { id },
      select: PROFILE_SELECT,
    });

    if (!user) throw new NotFoundException('User not found');

    return user;
  }

  async getProfileByUsername(username: string): Promise<PublicProfile> {
    const user = await this.userRepository.findOne({
      where: { username },
      select: PROFILE_SELECT,
    });

    if (!user) throw new NotFoundException('User not found');

    return user;
  }

  async updateProfile(
    userId: string,
    dto: UpdateProfileDto,
  ): Promise<PublicProfile> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: UPDATE_PROFILE_SELECT,
    });
    if (!user) throw new NotFoundException('User not found');

    const newEmail = dto.email;
    const changingEmail = newEmail !== undefined && newEmail !== user.email;
    const changingPassword = dto.newPassword !== undefined;

    if (changingEmail || changingPassword) {
      if (!dto.currentPassword) {
        throw new BadRequestException(
          'currentPassword is required to change email or password',
        );
      }
      const valid = await bcrypt.compare(
        dto.currentPassword,
        user.passwordHash,
      );
      if (!valid) {
        throw new UnauthorizedException('Invalid current password');
      }
    }

    if (changingEmail && newEmail !== undefined) {
      const taken = await this.userRepository.findOne({
        where: { email: newEmail },
        select: { id: true },
      });
      if (taken) throw new ConflictException('Email already in use');
      user.email = newEmail;
    }

    if (dto.username !== undefined && dto.username !== user.username) {
      const taken = await this.userRepository.findOne({
        where: { username: dto.username },
        select: { id: true },
      });
      if (taken) throw new ConflictException('Username already in use');
      user.username = dto.username;
    }

    if (dto.bio !== undefined) user.bio = dto.bio;
    if (dto.avatarUrl !== undefined) user.avatarUrl = dto.avatarUrl;

    if (changingPassword && dto.newPassword) {
      user.passwordHash = await bcrypt.hash(dto.newPassword, BCRYPT_ROUNDS);
    }

    await this.userRepository.save(user);

    return this.getProfileById(userId);
  }

  async list(page = 1, limit = 10) {
    const take = limit;
    const skip = (page - 1) * take;

    const [items, total] = await this.userRepository.findAndCount({
      take,
      skip,
      order: { createdAt: 'DESC' },
      select: PROFILE_SELECT,
    });

    return { items, total, page, limit };
  }

  async search(q: string, limit = 10) {
    const query = q.trim();

    const users = await this.userRepository.find({
      where: [
        { username: ILike(`%${query}%`) },
        { email: ILike(`%${query}%`) },
      ],
      take: limit,
      order: { username: 'ASC' },
      select: PROFILE_SELECT,
    });

    return users;
  }
}
