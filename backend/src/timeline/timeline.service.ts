import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Follow } from '../follows/entities/follow.entity';
import { TweetsService } from '../tweets/tweets.service';
import { Tweet } from '../tweets/entities/tweet.entity';

const DEFAULT_LIMIT = 20;

@Injectable()
export class TimelineService {
  constructor(
    @InjectRepository(Tweet)
    private readonly tweetRepository: Repository<Tweet>,
    @InjectRepository(Follow)
    private readonly followRepository: Repository<Follow>,
    private readonly tweetsService: TweetsService,
  ) {}

  async getFeed(userId: string, cursor?: string, limit = DEFAULT_LIMIT) {
    const take = limit;
    const parsedCursor = cursor ? this.parseCursor(cursor) : undefined;
    const authorIds = await this.getFeedAuthorIds(userId);

    const qb = this.tweetRepository
      .createQueryBuilder('tweet')
      .leftJoinAndSelect('tweet.author', 'author')
      .where('tweet.authorId IN (:...authorIds)', { authorIds })
      .andWhere('tweet.parentTweetId IS NULL')
      .orderBy('tweet.createdAt', 'DESC')
      .addOrderBy('tweet.id', 'DESC')
      .take(take + 1);

    if (parsedCursor) {
      qb.andWhere(
        '(tweet.createdAt < :cursorCreatedAt OR (tweet.createdAt = :cursorCreatedAt AND tweet.id < :cursorId))',
        {
          cursorCreatedAt: parsedCursor.createdAt,
          cursorId: parsedCursor.id,
        },
      );
    }

    const tweets = await qb.getMany();
    const hasMore = tweets.length > take;
    const pageTweets = hasMore ? tweets.slice(0, take) : tweets;

    const items = await this.tweetsService.mapTweetsWithLikes(
      pageTweets,
      userId,
    );

    const nextCursor = this.buildNextCursor(pageTweets, hasMore);

    return { items, hasMore, nextCursor };
  }

  private async getFeedAuthorIds(userId: string): Promise<string[]> {
    const follows = await this.followRepository.find({
      where: { followerId: userId },
      select: { followingId: true },
    });

    const followingIds = follows.map((f) => f.followingId);
    return [...new Set([userId, ...followingIds])];
  }

  private buildNextCursor(tweets: Tweet[], hasMore: boolean): string | null {
    if (!hasMore || tweets.length === 0) return null;
    const last = tweets[tweets.length - 1];
    return this.encodeCursor(last.createdAt, last.id);
  }

  private encodeCursor(createdAt: Date, id: string): string {
    return `${createdAt.toISOString()}|${id}`;
  }

  private parseCursor(cursor: string): { createdAt: Date; id: string } {
    const separator = cursor.indexOf('|');
    if (separator === -1) {
      throw new BadRequestException('Invalid cursor');
    }

    const createdAtRaw = cursor.slice(0, separator);
    const id = cursor.slice(separator + 1);
    const createdAt = new Date(createdAtRaw);

    if (!id || Number.isNaN(createdAt.getTime())) {
      throw new BadRequestException('Invalid cursor');
    }

    return { createdAt, id };
  }
}
