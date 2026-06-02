import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async getProfileByUsername(username: string) {
    const user = await this.userRepository.findOne({
      where: { username },
      select: {
        id: true,
        email: true,
        username: true,
        bio: true,
        avatarUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) throw new NotFoundException('User not found');

    return user;
  }

  async list(page = 1, limit = 10) {
    const take = limit;
    const skip = (page - 1) * take;

    const [items, total] = await this.userRepository.findAndCount({
      take,
      skip,
      order: { createdAt: 'DESC' },
      select: {
        id: true,
        email: true,
        username: true,
        bio: true,
        avatarUrl: true,
        createdAt: true,
        updatedAt: true,
      },
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
      select: {
        id: true,
        email: true,
        username: true,
        bio: true,
        avatarUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return users;
  }
}
