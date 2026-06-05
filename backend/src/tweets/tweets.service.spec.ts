import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Like } from './entities/like.entity';
import { Tweet } from './entities/tweet.entity';
import { EventsGateway } from '../events/events.gateway';
import { NotificationsService } from '../notifications/notifications.service';
import { TweetsService } from './tweets.service';

type MockRepo<T extends object> = Partial<
  Record<keyof Repository<T>, jest.Mock>
>;

function mockRepo<T extends object>(): MockRepo<T> {
  return {
    findOne: jest.fn(),
    findAndCount: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
    count: jest.fn(),
    createQueryBuilder: jest.fn(),
  };
}

const authorSummary = {
  id: 'u1',
  username: 'alice',
  avatarUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=alice',
};

describe('TweetsService', () => {
  let service: TweetsService;
  let tweetRepo: MockRepo<Tweet>;
  let likeRepo: MockRepo<Like>;
  let userRepo: MockRepo<User>;
  let createNotification: jest.Mock;
  let emitTimelineNewTweet: jest.Mock;
  let notificationsService: NotificationsService;
  let eventsGateway: EventsGateway;

  beforeEach(() => {
    tweetRepo = mockRepo<Tweet>();
    likeRepo = mockRepo<Like>();
    userRepo = mockRepo<User>();
    createNotification = jest.fn().mockResolvedValue(undefined);
    emitTimelineNewTweet = jest.fn().mockResolvedValue(undefined);
    notificationsService = {
      create: createNotification,
    } as unknown as NotificationsService;
    eventsGateway = {
      emitTimelineNewTweet,
    } as unknown as EventsGateway;
    service = new TweetsService(
      tweetRepo as unknown as Repository<Tweet>,
      likeRepo as unknown as Repository<Like>,
      userRepo as unknown as Repository<User>,
      notificationsService,
      eventsGateway,
    );
  });

  it('create saves a tweet and returns response with zero likes', async () => {
    (userRepo.findOne as jest.Mock).mockResolvedValue(authorSummary);
    (tweetRepo.create as jest.Mock).mockImplementation((x) => x);
    (tweetRepo.save as jest.Mock).mockImplementation((t) =>
      Promise.resolve({
        ...t,
        id: 't1',
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    );

    await expect(
      service.create('u1', { content: 'Hello world' }),
    ).resolves.toMatchObject({
      id: 't1',
      content: 'Hello world',
      authorId: 'u1',
      likesCount: 0,
      likedByMe: false,
      author: authorSummary,
    });

    expect(emitTimelineNewTweet).toHaveBeenCalledWith(
      'u1',
      expect.objectContaining({ id: 't1', authorId: 'u1' }),
    );
  });

  it('delete throws ForbiddenException when requester is not the author', async () => {
    (tweetRepo.findOne as jest.Mock).mockResolvedValue({
      id: 't1',
      authorId: 'u2',
    });

    await expect(service.delete('t1', 'u1')).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });

  it('delete throws NotFoundException when tweet does not exist', async () => {
    (tweetRepo.findOne as jest.Mock).mockResolvedValue(null);

    await expect(service.delete('missing', 'u1')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('delete removes tweet when requester is the author', async () => {
    const tweet = { id: 't1', authorId: 'u1' };
    (tweetRepo.findOne as jest.Mock).mockResolvedValue(tweet);
    (tweetRepo.remove as jest.Mock).mockResolvedValue(tweet);

    await expect(service.delete('t1', 'u1')).resolves.toBeUndefined();
    expect(tweetRepo.remove).toHaveBeenCalledWith(tweet);
  });

  it('like throws ConflictException when already liked', async () => {
    (tweetRepo.findOne as jest.Mock).mockResolvedValue({
      id: 't1',
      authorId: 'u1',
      content: 'hi',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    (likeRepo.findOne as jest.Mock).mockResolvedValue({ id: 'l1' });

    await expect(service.like('t1', 'u2')).rejects.toBeInstanceOf(
      ConflictException,
    );
  });

  it('unlike throws NotFoundException when like does not exist', async () => {
    (tweetRepo.findOne as jest.Mock).mockResolvedValue({ id: 't1' });
    (likeRepo.findOne as jest.Mock).mockResolvedValue(null);

    await expect(service.unlike('t1', 'u2')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('getByUsername returns paginated tweets with likes metadata', async () => {
    const tweet: Tweet = {
      id: 't1',
      content: 'Hello',
      authorId: 'u1',
      author: {
        id: 'u1',
        email: 'a@a.com',
        username: 'alice',
        passwordHash: 'hash',
        bio: '',
        avatarUrl: authorSummary.avatarUrl,
        tweets: [],
        following: [],
        followers: [],
        likes: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      likes: [],
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-02'),
    };

    (userRepo.findOne as jest.Mock).mockResolvedValue({ id: 'u1' });
    (tweetRepo.findAndCount as jest.Mock).mockResolvedValue([[tweet], 1]);

    const qb = {
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      groupBy: jest.fn().mockReturnThis(),
      getRawMany: jest.fn().mockResolvedValue([{ tweetId: 't1', count: '2' }]),
    };
    (likeRepo.createQueryBuilder as jest.Mock).mockReturnValue(qb);
    (likeRepo.find as jest.Mock).mockResolvedValue([{ tweetId: 't1' }]);

    await expect(service.getByUsername('alice', 'u2', 1, 10)).resolves.toEqual({
      items: [
        expect.objectContaining({
          id: 't1',
          likesCount: 2,
          likedByMe: true,
        }),
      ],
      total: 1,
      page: 1,
      limit: 10,
    });
  });

  it('like creates like and returns updated tweet', async () => {
    const tweet = {
      id: 't1',
      authorId: 'u1',
      content: 'hi',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    (tweetRepo.findOne as jest.Mock).mockResolvedValue(tweet);
    (likeRepo.findOne as jest.Mock).mockResolvedValue(null);
    (likeRepo.create as jest.Mock).mockImplementation((x) => x);
    (likeRepo.save as jest.Mock).mockResolvedValue({});
    (likeRepo.count as jest.Mock).mockResolvedValue(1);
    (userRepo.findOne as jest.Mock).mockResolvedValue(authorSummary);

    await expect(service.like('t1', 'u2')).resolves.toMatchObject({
      id: 't1',
      likesCount: 1,
      likedByMe: true,
    });
    expect(createNotification).toHaveBeenCalled();
  });

  it('unlike removes like', async () => {
    (tweetRepo.findOne as jest.Mock).mockResolvedValue({ id: 't1' });
    (likeRepo.findOne as jest.Mock).mockResolvedValue({ id: 'l1' });
    (likeRepo.remove as jest.Mock).mockResolvedValue({});

    await expect(service.unlike('t1', 'u2')).resolves.toBeUndefined();
  });

  it('create throws when author not found', async () => {
    (userRepo.findOne as jest.Mock).mockResolvedValue(null);

    await expect(
      service.create('missing', { content: 'Hello' }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('getByUsername throws NotFoundException when user does not exist', async () => {
    (userRepo.findOne as jest.Mock).mockResolvedValue(null);

    await expect(service.getByUsername('ghost', 'u1')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('like throws NotFoundException when tweet does not exist', async () => {
    (tweetRepo.findOne as jest.Mock).mockResolvedValue(null);

    await expect(service.like('missing', 'u1')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('mapTweetsWithLikes returns empty array for no tweets', async () => {
    await expect(service.mapTweetsWithLikes([], 'u1')).resolves.toEqual([]);
    expect(likeRepo.createQueryBuilder).not.toHaveBeenCalled();
  });

  it('mapTweetsWithLikes marks tweets as not liked when user has no likes', async () => {
    const tweet: Tweet = {
      id: 't1',
      content: 'Hello',
      authorId: 'u1',
      author: {
        id: 'u1',
        email: 'a@a.com',
        username: 'alice',
        passwordHash: 'hash',
        bio: '',
        avatarUrl: authorSummary.avatarUrl,
        tweets: [],
        following: [],
        followers: [],
        likes: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      likes: [],
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-02'),
    };

    const qb = {
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      groupBy: jest.fn().mockReturnThis(),
      getRawMany: jest.fn().mockResolvedValue([]),
    };
    (likeRepo.createQueryBuilder as jest.Mock).mockReturnValue(qb);
    (likeRepo.find as jest.Mock).mockResolvedValue([]);

    await expect(service.mapTweetsWithLikes([tweet], 'u2')).resolves.toEqual([
      expect.objectContaining({
        id: 't1',
        likesCount: 0,
        likedByMe: false,
      }),
    ]);
  });

  it('like throws NotFoundException when tweet author no longer exists', async () => {
    (tweetRepo.findOne as jest.Mock).mockResolvedValue({
      id: 't1',
      authorId: 'missing',
      content: 'hi',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    (likeRepo.findOne as jest.Mock).mockResolvedValue(null);
    (likeRepo.create as jest.Mock).mockImplementation((x) => x);
    (likeRepo.save as jest.Mock).mockResolvedValue({});
    (userRepo.findOne as jest.Mock).mockResolvedValue(null);

    await expect(service.like('t1', 'u2')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
