import {
  BadRequestException,
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

jest.mock('./tweet-media.storage', () => ({
  saveTweetImage: jest.fn(() => '/uploads/test-image.jpg'),
}));

type MockRepo<T extends object> = Partial<
  Record<keyof Repository<T>, jest.Mock>
>;

function mockRepo<T extends object>(): MockRepo<T> {
  return {
    findOne: jest.fn(),
    findOneBy: jest.fn(),
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
  let createReplyNotification: jest.Mock;
  let emitTimelineNewTweet: jest.Mock;
  let notificationsService: NotificationsService;
  let eventsGateway: EventsGateway;

  beforeEach(() => {
    tweetRepo = mockRepo<Tweet>();
    likeRepo = mockRepo<Like>();
    userRepo = mockRepo<User>();
    createNotification = jest.fn().mockResolvedValue(undefined);
    createReplyNotification = jest.fn().mockResolvedValue(undefined);
    emitTimelineNewTweet = jest.fn().mockResolvedValue(undefined);
    notificationsService = {
      create: createNotification,
      createReplyNotification,
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
      repliesCount: 0,
      parentTweetId: null,
      imageUrl: null,
      author: authorSummary,
    });

    expect(emitTimelineNewTweet).toHaveBeenCalledWith(
      'u1',
      expect.objectContaining({ id: 't1', authorId: 'u1' }),
    );
  });

  it('create saves imageUrl when a file is uploaded', async () => {
    (userRepo.findOne as jest.Mock).mockResolvedValue(authorSummary);
    (tweetRepo.create as jest.Mock).mockImplementation((x) => x);
    (tweetRepo.save as jest.Mock).mockImplementation((t) =>
      Promise.resolve({
        ...t,
        id: 't2',
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    );

    await expect(
      service.create(
        'u1',
        { content: 'Photo tweet' },
        {
          buffer: Buffer.from('fake-image'),
          mimetype: 'image/png',
        },
      ),
    ).resolves.toMatchObject({
      id: 't2',
      content: 'Photo tweet',
      imageUrl: '/uploads/test-image.jpg',
    });
  });

  it('create throws BadRequestException when content and image are missing', async () => {
    await expect(service.create('u1', {})).rejects.toBeInstanceOf(
      BadRequestException,
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
      parentTweetId: null,
      imageUrl: null,
      parent: null,
      replies: [],
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-02'),
    };

    (userRepo.findOne as jest.Mock).mockResolvedValue({ id: 'u1' });
    (tweetRepo.findAndCount as jest.Mock).mockResolvedValue([[tweet], 1]);

    const likesQb = {
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      groupBy: jest.fn().mockReturnThis(),
      getRawMany: jest.fn().mockResolvedValue([{ tweetId: 't1', count: '2' }]),
    };
    const repliesQb = {
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      groupBy: jest.fn().mockReturnThis(),
      getRawMany: jest.fn().mockResolvedValue([]),
    };
    (likeRepo.createQueryBuilder as jest.Mock).mockReturnValue(likesQb);
    (tweetRepo.createQueryBuilder as jest.Mock).mockReturnValue(repliesQb);
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
    (tweetRepo.count as jest.Mock).mockResolvedValue(0);
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
      parentTweetId: null,
      imageUrl: null,
      parent: null,
      replies: [],
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-02'),
    };

    const likesQb = {
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      groupBy: jest.fn().mockReturnThis(),
      getRawMany: jest.fn().mockResolvedValue([]),
    };
    const repliesQb = {
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      groupBy: jest.fn().mockReturnThis(),
      getRawMany: jest.fn().mockResolvedValue([]),
    };
    (likeRepo.createQueryBuilder as jest.Mock).mockReturnValue(likesQb);
    (tweetRepo.createQueryBuilder as jest.Mock).mockReturnValue(repliesQb);
    (likeRepo.find as jest.Mock).mockResolvedValue([]);

    await expect(service.mapTweetsWithLikes([tweet], 'u2')).resolves.toEqual([
      expect.objectContaining({
        id: 't1',
        likesCount: 0,
        likedByMe: false,
        repliesCount: 0,
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

  it('create saves image-only tweet without text content', async () => {
    (userRepo.findOne as jest.Mock).mockResolvedValue(authorSummary);
    (tweetRepo.create as jest.Mock).mockImplementation((x) => x);
    (tweetRepo.save as jest.Mock).mockImplementation((t) =>
      Promise.resolve({
        ...t,
        id: 't-img',
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    );

    await expect(
      service.create(
        'u1',
        {},
        { buffer: Buffer.from('img'), mimetype: 'image/jpeg' },
      ),
    ).resolves.toMatchObject({
      id: 't-img',
      content: '',
      imageUrl: '/uploads/test-image.jpg',
    });
  });

  it('create reply links to root tweet and notifies parent author', async () => {
    const parentId = 'parent-1';
    const rootId = 'root-1';

    (userRepo.findOne as jest.Mock).mockResolvedValue(authorSummary);
    (tweetRepo.findOneBy as jest.Mock).mockResolvedValue({
      id: parentId,
      authorId: 'u2',
      parentTweetId: rootId,
    });
    (tweetRepo.findOne as jest.Mock).mockImplementation(
      ({ where }: { where: { id: string } }) => {
        if (where.id === rootId) {
          return Promise.resolve({ id: rootId, parentTweetId: null });
        }
        return Promise.resolve(null);
      },
    );
    (tweetRepo.create as jest.Mock).mockImplementation((x) => x);
    (tweetRepo.save as jest.Mock).mockImplementation((t) =>
      Promise.resolve({
        ...t,
        id: 'reply-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    );

    await expect(
      service.create('u1', { content: 'Nice thread', parentTweetId: parentId }),
    ).resolves.toMatchObject({
      id: 'reply-1',
      content: 'Nice thread',
      parentTweetId: rootId,
    });

    expect(createReplyNotification).toHaveBeenCalledWith('u2', 'u1', 'reply-1');
    expect(emitTimelineNewTweet).not.toHaveBeenCalled();
  });

  it('create throws NotFoundException when parent tweet does not exist', async () => {
    (userRepo.findOne as jest.Mock).mockResolvedValue(authorSummary);
    (tweetRepo.findOneBy as jest.Mock).mockResolvedValue(null);

    await expect(
      service.create('u1', {
        content: 'Orphan reply',
        parentTweetId: 'missing-parent',
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('getThread returns root tweet and direct replies', async () => {
    const rootTweet: Tweet = {
      id: 'root-1',
      content: 'Root',
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
      parentTweetId: null,
      imageUrl: null,
      parent: null,
      replies: [],
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    };
    const replyTweet: Tweet = {
      ...rootTweet,
      id: 'reply-1',
      content: 'Reply',
      parentTweetId: 'root-1',
      createdAt: new Date('2024-01-02'),
      updatedAt: new Date('2024-01-02'),
    };

    (tweetRepo.findOne as jest.Mock).mockResolvedValue(rootTweet);
    (tweetRepo.find as jest.Mock).mockResolvedValue([replyTweet]);

    const likesQb = {
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      groupBy: jest.fn().mockReturnThis(),
      getRawMany: jest.fn().mockResolvedValue([]),
    };
    const repliesQb = {
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      groupBy: jest.fn().mockReturnThis(),
      getRawMany: jest
        .fn()
        .mockResolvedValue([{ parentTweetId: 'root-1', count: '1' }]),
    };
    (likeRepo.createQueryBuilder as jest.Mock).mockReturnValue(likesQb);
    (tweetRepo.createQueryBuilder as jest.Mock).mockReturnValue(repliesQb);
    (likeRepo.find as jest.Mock).mockResolvedValue([]);

    await expect(service.getThread('root-1', 'u2')).resolves.toMatchObject({
      root: { id: 'root-1', repliesCount: 1 },
      replies: [{ id: 'reply-1', content: 'Reply' }],
    });
  });

  it('getThread resolves nested reply to root tweet', async () => {
    const rootTweet: Tweet = {
      id: 'root-1',
      content: 'Root',
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
      parentTweetId: null,
      imageUrl: null,
      parent: null,
      replies: [],
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    };
    const nestedReply: Tweet = {
      ...rootTweet,
      id: 'nested-1',
      content: 'Nested',
      parentTweetId: 'root-1',
      createdAt: new Date('2024-01-02'),
      updatedAt: new Date('2024-01-02'),
    };

    (tweetRepo.findOne as jest.Mock).mockImplementation(
      ({
        where,
        relations,
      }: {
        where: { id: string };
        relations?: string[];
      }) => {
        if (where.id === 'nested-1') {
          return Promise.resolve(nestedReply);
        }
        if (where.id === 'root-1') {
          return Promise.resolve(
            relations?.includes('author')
              ? rootTweet
              : { id: 'root-1', parentTweetId: null },
          );
        }
        return Promise.resolve(null);
      },
    );
    (tweetRepo.find as jest.Mock).mockResolvedValue([nestedReply]);

    const emptyQb = {
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      groupBy: jest.fn().mockReturnThis(),
      getRawMany: jest.fn().mockResolvedValue([]),
    };
    (likeRepo.createQueryBuilder as jest.Mock).mockReturnValue(emptyQb);
    (tweetRepo.createQueryBuilder as jest.Mock).mockReturnValue(emptyQb);
    (likeRepo.find as jest.Mock).mockResolvedValue([]);

    await expect(service.getThread('nested-1', 'u2')).resolves.toMatchObject({
      root: { id: 'root-1' },
      replies: [{ id: 'nested-1' }],
    });
  });

  it('getThread throws NotFoundException when tweet does not exist', async () => {
    (tweetRepo.findOne as jest.Mock).mockResolvedValue(null);

    await expect(service.getThread('missing', 'u1')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('create throws BadRequestException when thread chain is broken', async () => {
    (userRepo.findOne as jest.Mock).mockResolvedValue(authorSummary);
    (tweetRepo.findOneBy as jest.Mock).mockResolvedValue({
      id: 'child-1',
      authorId: 'u2',
      parentTweetId: 'missing-root',
    });
    (tweetRepo.findOne as jest.Mock).mockResolvedValue(null);

    await expect(
      service.create('u1', {
        content: 'Broken thread',
        parentTweetId: 'child-1',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
