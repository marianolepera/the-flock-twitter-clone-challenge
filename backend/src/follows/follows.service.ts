import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PublicProfile } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import { Follow } from './entities/follow.entity';

@Injectable()
export class FollowsService {
  constructor(
    @InjectRepository(Follow)
    private readonly followRepository: Repository<Follow>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async follow(followerId: string, targetUsername: string) {
    const target = await this.findUserByUsername(targetUsername);

    if (target.id === followerId) {
      throw new BadRequestException('You cannot follow yourself');
    }

    const existing = await this.followRepository.findOne({
      where: { followerId, followingId: target.id },
    });
    if (existing) {
      throw new ConflictException('Already following this user');
    }

    const follow = this.followRepository.create({
      followerId,
      followingId: target.id,
    });
    await this.followRepository.save(follow);

    return { following: true };
  }

  async unfollow(followerId: string, targetUsername: string) {
    const target = await this.findUserByUsername(targetUsername);

    const existing = await this.followRepository.findOne({
      where: { followerId, followingId: target.id },
    });
    if (!existing) {
      throw new NotFoundException('Not following this user');
    }

    await this.followRepository.remove(existing);

    return { following: false };
  }

  async getFollowers(username: string, page = 1, limit = 10) {
    const user = await this.findUserByUsername(username);
    return this.listRelatedUsers(user.id, 'followingId', page, limit);
  }

  async getFollowing(username: string, page = 1, limit = 10) {
    const user = await this.findUserByUsername(username);
    return this.listRelatedUsers(user.id, 'followerId', page, limit);
  }

  private async findUserByUsername(username: string) {
    const user = await this.userRepository.findOne({
      where: { username },
      select: { id: true },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  private async listRelatedUsers(
    userId: string,
    filterColumn: 'followerId' | 'followingId',
    page: number,
    limit: number,
  ) {
    const take = limit;
    const skip = (page - 1) * take;
    const relationKey =
      filterColumn === 'followingId' ? 'follower' : 'following';

    const [follows, total] = await this.followRepository.findAndCount({
      where: { [filterColumn]: userId },
      relations: [relationKey],
      take,
      skip,
      order: { createdAt: 'DESC' },
    });

    const items = follows.map((follow) =>
      this.toPublicProfile(follow[relationKey]),
    );

    return { items, total, page, limit };
  }

  private toPublicProfile(user: User): PublicProfile {
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      bio: user.bio,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
