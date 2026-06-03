import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Follow } from './entities/follow.entity';
import { FollowsService } from './follows.service';

type MockRepo<T extends object> = Partial<
  Record<keyof Repository<T>, jest.Mock>
>;

function mockRepo<T extends object>(): MockRepo<T> {
  return {
    findOne: jest.fn(),
    findAndCount: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
  };
}

describe('FollowsService', () => {
  let service: FollowsService;
  let followRepo: MockRepo<Follow>;
  let userRepo: MockRepo<User>;

  beforeEach(() => {
    followRepo = mockRepo<Follow>();
    userRepo = mockRepo<User>();
    service = new FollowsService(
      followRepo as unknown as Repository<Follow>,
      userRepo as unknown as Repository<User>,
    );
  });

  it('follow throws NotFoundException when target user does not exist', async () => {
    (userRepo.findOne as jest.Mock).mockResolvedValue(null);

    await expect(service.follow('u1', 'ghost')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('follow throws BadRequestException when following yourself', async () => {
    (userRepo.findOne as jest.Mock).mockResolvedValue({ id: 'u1' });

    await expect(service.follow('u1', 'alice')).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('follow throws ConflictException when already following', async () => {
    (userRepo.findOne as jest.Mock).mockResolvedValue({ id: 'u2' });
    (followRepo.findOne as jest.Mock).mockResolvedValue({ id: 'f1' });

    await expect(service.follow('u1', 'bob')).rejects.toBeInstanceOf(
      ConflictException,
    );
  });

  it('follow creates a follow relationship', async () => {
    (userRepo.findOne as jest.Mock).mockResolvedValue({ id: 'u2' });
    (followRepo.findOne as jest.Mock).mockResolvedValue(null);
    (followRepo.create as jest.Mock).mockImplementation((x) => x);
    (followRepo.save as jest.Mock).mockResolvedValue({});

    await expect(service.follow('u1', 'bob')).resolves.toEqual({
      following: true,
    });

    expect(followRepo.save).toHaveBeenCalledWith({
      followerId: 'u1',
      followingId: 'u2',
    });
  });

  it('unfollow throws NotFoundException when not following', async () => {
    (userRepo.findOne as jest.Mock).mockResolvedValue({ id: 'u2' });
    (followRepo.findOne as jest.Mock).mockResolvedValue(null);

    await expect(service.unfollow('u1', 'bob')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('unfollow removes the follow relationship', async () => {
    const existing = { id: 'f1', followerId: 'u1', followingId: 'u2' };
    (userRepo.findOne as jest.Mock).mockResolvedValue({ id: 'u2' });
    (followRepo.findOne as jest.Mock).mockResolvedValue(existing);
    (followRepo.remove as jest.Mock).mockResolvedValue(existing);

    await expect(service.unfollow('u1', 'bob')).resolves.toEqual({
      following: false,
    });

    expect(followRepo.remove).toHaveBeenCalledWith(existing);
  });

  it('getFollowers returns paginated public profiles', async () => {
    const follower: User = {
      id: 'u2',
      email: 'b@b.com',
      username: 'bob',
      passwordHash: 'hash',
      bio: '',
      avatarUrl: 'https://example.com/a.svg',
      tweets: [],
      following: [],
      followers: [],
      likes: [],
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-02'),
    };

    (userRepo.findOne as jest.Mock).mockResolvedValue({ id: 'u1' });
    (followRepo.findAndCount as jest.Mock).mockResolvedValue([
      [{ follower }],
      1,
    ]);

    await expect(service.getFollowers('alice', 1, 10)).resolves.toEqual({
      items: [
        {
          id: 'u2',
          email: 'b@b.com',
          username: 'bob',
          bio: '',
          avatarUrl: 'https://example.com/a.svg',
          createdAt: follower.createdAt,
          updatedAt: follower.updatedAt,
        },
      ],
      total: 1,
      page: 1,
      limit: 10,
    });
  });

  it('getFollowing returns paginated public profiles', async () => {
    const following: User = {
      id: 'u2',
      email: 'b@b.com',
      username: 'bob',
      passwordHash: 'hash',
      bio: '',
      avatarUrl: 'https://example.com/a.svg',
      tweets: [],
      following: [],
      followers: [],
      likes: [],
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-02'),
    };

    (userRepo.findOne as jest.Mock).mockResolvedValue({ id: 'u1' });
    (followRepo.findAndCount as jest.Mock).mockResolvedValue([
      [{ following }],
      1,
    ]);

    await expect(service.getFollowing('alice', 1, 10)).resolves.toEqual({
      items: [
        expect.objectContaining({
          id: 'u2',
          username: 'bob',
        }),
      ],
      total: 1,
      page: 1,
      limit: 10,
    });
  });
});
