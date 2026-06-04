import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Tweet } from '../tweets/entities/tweet.entity';
import { Notification } from './entities/notification.entity';
import { NotificationType } from './entities/notification-type';

export type NotificationActorSummary = Pick<
  User,
  'id' | 'username' | 'avatarUrl'
>;

export type NotificationTweetSummary = Pick<Tweet, 'id' | 'content'>;

export type NotificationResponse = {
  id: string;
  type: NotificationType;
  actor: NotificationActorSummary;
  tweet: NotificationTweetSummary | null;
  readAt: Date | null;
  createdAt: Date;
};

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
  ) {}

  async create(params: {
    recipientId: string;
    actorId: string;
    type: NotificationType;
    tweetId?: string | null;
  }): Promise<void> {
    if (params.recipientId === params.actorId) return;

    const notification = this.notificationRepository.create({
      recipientId: params.recipientId,
      actorId: params.actorId,
      type: params.type,
      tweetId:
        params.type === NotificationType.LIKE ? (params.tweetId ?? null) : null,
    });

    await this.notificationRepository.save(notification);
  }

  async findAll(recipientId: string, page = 1, limit = 20) {
    const take = limit;
    const skip = (page - 1) * take;

    const [notifications, total] =
      await this.notificationRepository.findAndCount({
        where: { recipientId },
        relations: ['actor', 'tweet'],
        order: { createdAt: 'DESC' },
        take,
        skip,
      });

    return {
      items: notifications.map((n) => this.toResponse(n)),
      total,
      page,
      limit,
    };
  }

  async unreadCount(recipientId: string): Promise<{ count: number }> {
    const count = await this.notificationRepository.count({
      where: { recipientId, readAt: IsNull() },
    });
    return { count };
  }

  async markAllRead(recipientId: string): Promise<{ updated: number }> {
    const result = await this.notificationRepository.update(
      { recipientId, readAt: IsNull() },
      { readAt: new Date() },
    );

    return { updated: result.affected ?? 0 };
  }

  private toResponse(notification: Notification): NotificationResponse {
    return {
      id: notification.id,
      type: notification.type,
      actor: {
        id: notification.actor.id,
        username: notification.actor.username,
        avatarUrl: notification.actor.avatarUrl,
      },
      tweet: notification.tweet
        ? {
            id: notification.tweet.id,
            content: notification.tweet.content,
          }
        : null,
      readAt: notification.readAt,
      createdAt: notification.createdAt,
    };
  }
}
