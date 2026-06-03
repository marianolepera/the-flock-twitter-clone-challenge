import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { CreateTweetDto } from './dto/create-tweet.dto';
import { Like } from './entities/like.entity';
import { Tweet } from './entities/tweet.entity';

export type TweetAuthorSummary = Pick<User, 'id' | 'username' | 'avatarUrl'>;

export type TweetResponse = {
  id: string;
  content: string;
  authorId: string;
  author: TweetAuthorSummary;
  likesCount: number;
  likedByMe: boolean;
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class TweetsService {
  constructor(
    @InjectRepository(Tweet)
    private readonly tweetRepository: Repository<Tweet>,
    @InjectRepository(Like)
    private readonly likeRepository: Repository<Like>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(authorId: string, dto: CreateTweetDto): Promise<TweetResponse> {
    const author = await this.userRepository.findOne({
      where: { id: authorId },
      select: { id: true, username: true, avatarUrl: true },
    });
    if (!author) throw new NotFoundException('User not found');

    const tweet = this.tweetRepository.create({
      content: dto.content,
      authorId,
    });
    const saved = await this.tweetRepository.save(tweet);

    return this.toTweetResponse(saved, author, 0, false);
  }

  async delete(tweetId: string, requesterId: string): Promise<void> {
    const tweet = await this.tweetRepository.findOne({
      where: { id: tweetId },
      select: { id: true, authorId: true },
    });
    if (!tweet) throw new NotFoundException('Tweet not found');
    if (tweet.authorId !== requesterId) {
      throw new ForbiddenException('You can only delete your own tweets');
    }

    await this.tweetRepository.remove(tweet);
  }

  async getByUsername(
    username: string,
    requesterId: string,
    page = 1,
    limit = 10,
  ) {
    const author = await this.userRepository.findOne({
      where: { username },
      select: { id: true },
    });
    if (!author) throw new NotFoundException('User not found');

    const take = limit;
    const skip = (page - 1) * take;

    const [tweets, total] = await this.tweetRepository.findAndCount({
      where: { authorId: author.id },
      relations: ['author'],
      order: { createdAt: 'DESC' },
      take,
      skip,
    });

    const items = await this.mapTweetsWithLikes(tweets, requesterId);

    return { items, total, page, limit };
  }

  async like(tweetId: string, userId: string) {
    const tweet = await this.findTweetOrThrow(tweetId);

    const existing = await this.likeRepository.findOne({
      where: { userId, tweetId },
    });
    if (existing) {
      throw new ConflictException('Already liked this tweet');
    }

    const like = this.likeRepository.create({ userId, tweetId });
    await this.likeRepository.save(like);

    const likesCount = await this.likeRepository.count({ where: { tweetId } });
    const author = await this.getAuthorSummary(tweet.authorId);

    return this.toTweetResponse(tweet, author, likesCount, true);
  }

  async unlike(tweetId: string, userId: string) {
    await this.findTweetOrThrow(tweetId);

    const existing = await this.likeRepository.findOne({
      where: { userId, tweetId },
    });
    if (!existing) {
      throw new NotFoundException('Like not found');
    }

    await this.likeRepository.remove(existing);
  }

  private async findTweetOrThrow(tweetId: string) {
    const tweet = await this.tweetRepository.findOne({
      where: { id: tweetId },
    });
    if (!tweet) throw new NotFoundException('Tweet not found');
    return tweet;
  }

  private async getAuthorSummary(
    authorId: string,
  ): Promise<TweetAuthorSummary> {
    const author = await this.userRepository.findOne({
      where: { id: authorId },
      select: { id: true, username: true, avatarUrl: true },
    });
    if (!author) throw new NotFoundException('User not found');
    return author;
  }

  async mapTweetsWithLikes(
    tweets: Tweet[],
    requesterId: string,
  ): Promise<TweetResponse[]> {
    if (tweets.length === 0) return [];

    const tweetIds = tweets.map((t) => t.id);
    const likesCountRows = await this.likeRepository
      .createQueryBuilder('like')
      .select('like.tweetId', 'tweetId')
      .addSelect('COUNT(*)', 'count')
      .where('like.tweetId IN (:...tweetIds)', { tweetIds })
      .groupBy('like.tweetId')
      .getRawMany<{ tweetId: string; count: string }>();

    const likesCountByTweet = new Map(
      likesCountRows.map((row) => [row.tweetId, parseInt(row.count, 10)]),
    );

    const myLikes = await this.likeRepository.find({
      where: { userId: requesterId, tweetId: In(tweetIds) },
      select: { tweetId: true },
    });
    const likedByMeSet = new Set(myLikes.map((l) => l.tweetId));

    return tweets.map((tweet) =>
      this.toTweetResponse(
        tweet,
        {
          id: tweet.author.id,
          username: tweet.author.username,
          avatarUrl: tweet.author.avatarUrl,
        },
        likesCountByTweet.get(tweet.id) ?? 0,
        likedByMeSet.has(tweet.id),
      ),
    );
  }

  private toTweetResponse(
    tweet: Tweet,
    author: TweetAuthorSummary,
    likesCount: number,
    likedByMe: boolean,
  ): TweetResponse {
    return {
      id: tweet.id,
      content: tweet.content,
      authorId: tweet.authorId,
      author,
      likesCount,
      likedByMe,
      createdAt: tweet.createdAt,
      updatedAt: tweet.updatedAt,
    };
  }
}
