import { BadRequestException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Follow } from '../follows/entities/follow.entity';
import { Tweet } from '../tweets/entities/tweet.entity';
import { TweetsService } from '../tweets/tweets.service';
import { TimelineService } from './timeline.service';

type MockRepo<T extends object> = Partial<
  Record<keyof Repository<T>, jest.Mock>
>;

function mockRepo<T extends object>(): MockRepo<T> {
  return {
    find: jest.fn(),
    createQueryBuilder: jest.fn(),
  };
}

function mockQueryBuilder(tweets: Tweet[]) {
  const qb = {
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    addOrderBy: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    getMany: jest.fn().mockResolvedValue(tweets),
  };
  return qb;
}

describe('TimelineService', () => {
  let service: TimelineService;
  let tweetRepo: MockRepo<Tweet>;
  let followRepo: MockRepo<Follow>;
  let tweetsService: { mapTweetsWithLikes: jest.Mock };

  const author = {
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
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const ownTweet: Tweet = {
    id: 't1',
    content: 'My tweet',
    authorId: 'u1',
    author: { ...author, id: 'u1', username: 'alice' },
    likes: [],
    parentTweetId: null,
    imageUrl: null,
    parent: null,
    replies: [],
    createdAt: new Date('2024-06-03T12:00:00.000Z'),
    updatedAt: new Date('2024-06-03T12:00:00.000Z'),
  };

  const followedTweet: Tweet = {
    id: 't2',
    content: 'Bob tweet',
    authorId: 'u2',
    author,
    likes: [],
    parentTweetId: null,
    imageUrl: null,
    parent: null,
    replies: [],
    createdAt: new Date('2024-06-03T11:00:00.000Z'),
    updatedAt: new Date('2024-06-03T11:00:00.000Z'),
  };

  beforeEach(() => {
    tweetRepo = mockRepo<Tweet>();
    followRepo = mockRepo<Follow>();
    tweetsService = { mapTweetsWithLikes: jest.fn() };
    service = new TimelineService(
      tweetRepo as unknown as Repository<Tweet>,
      followRepo as unknown as Repository<Follow>,
      tweetsService as unknown as TweetsService,
    );
  });

  it('getFeed returns empty items when user has no follows and no tweets', async () => {
    (followRepo.find as jest.Mock).mockResolvedValue([]);
    (tweetRepo.createQueryBuilder as jest.Mock).mockReturnValue(
      mockQueryBuilder([]),
    );
    tweetsService.mapTweetsWithLikes.mockResolvedValue([]);

    await expect(service.getFeed('u1')).resolves.toEqual({
      items: [],
      hasMore: false,
      nextCursor: null,
    });
  });

  it('getFeed includes own tweets', async () => {
    (followRepo.find as jest.Mock).mockResolvedValue([]);
    (tweetRepo.createQueryBuilder as jest.Mock).mockReturnValue(
      mockQueryBuilder([ownTweet]),
    );
    tweetsService.mapTweetsWithLikes.mockResolvedValue([
      { id: 't1', content: 'My tweet' },
    ]);

    const result = await service.getFeed('u1');

    expect(result.items).toHaveLength(1);
    expect(tweetsService.mapTweetsWithLikes).toHaveBeenCalledWith(
      [ownTweet],
      'u1',
    );
  });

  it('getFeed includes tweets from followed users', async () => {
    (followRepo.find as jest.Mock).mockResolvedValue([{ followingId: 'u2' }]);
    const qb = mockQueryBuilder([ownTweet, followedTweet]);
    (tweetRepo.createQueryBuilder as jest.Mock).mockReturnValue(qb);
    tweetsService.mapTweetsWithLikes.mockResolvedValue([
      { id: 't1' },
      { id: 't2' },
    ]);

    const result = await service.getFeed('u1');

    expect(result.items).toHaveLength(2);
    expect(qb.where).toHaveBeenCalledWith('tweet.authorId IN (:...authorIds)', {
      authorIds: ['u1', 'u2'],
    });
  });

  it('getFeed sets hasMore and nextCursor when more tweets exist', async () => {
    (followRepo.find as jest.Mock).mockResolvedValue([]);
    const extraTweet: Tweet = {
      ...followedTweet,
      id: 't3',
      createdAt: new Date('2024-06-03T10:00:00.000Z'),
    };
    (tweetRepo.createQueryBuilder as jest.Mock).mockReturnValue(
      mockQueryBuilder([ownTweet, followedTweet, extraTweet]),
    );
    tweetsService.mapTweetsWithLikes.mockResolvedValue([
      { id: 't1' },
      { id: 't2' },
    ]);

    const result = await service.getFeed('u1', undefined, 2);

    expect(result.hasMore).toBe(true);
    expect(result.nextCursor).toBe('2024-06-03T11:00:00.000Z|t2');
    expect(tweetsService.mapTweetsWithLikes).toHaveBeenCalledWith(
      [ownTweet, followedTweet],
      'u1',
    );
  });

  it('getFeed throws BadRequestException for invalid cursor', async () => {
    (followRepo.find as jest.Mock).mockResolvedValue([]);

    await expect(service.getFeed('u1', 'bad-cursor')).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('getFeed throws BadRequestException for cursor with invalid date', async () => {
    (followRepo.find as jest.Mock).mockResolvedValue([]);

    await expect(service.getFeed('u1', 'not-a-date|t1')).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('getFeed throws BadRequestException for cursor with empty id', async () => {
    (followRepo.find as jest.Mock).mockResolvedValue([]);

    await expect(
      service.getFeed('u1', '2024-06-03T12:00:00.000Z|'),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('getFeed applies cursor filter for next page', async () => {
    (followRepo.find as jest.Mock).mockResolvedValue([]);
    const qb = mockQueryBuilder([followedTweet]);
    (tweetRepo.createQueryBuilder as jest.Mock).mockReturnValue(qb);
    tweetsService.mapTweetsWithLikes.mockResolvedValue([{ id: 't2' }]);

    const cursor = '2024-06-03T12:00:00.000Z|t1';
    await service.getFeed('u1', cursor, 10);

    expect(qb.andWhere).toHaveBeenCalledWith(
      '(tweet.createdAt < :cursorCreatedAt OR (tweet.createdAt = :cursorCreatedAt AND tweet.id < :cursorId))',
      {
        cursorCreatedAt: new Date('2024-06-03T12:00:00.000Z'),
        cursorId: 't1',
      },
    );
  });
});
