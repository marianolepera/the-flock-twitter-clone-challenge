import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Repository } from 'typeorm';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { Follow } from '../follows/entities/follow.entity';
import { NotificationResponse } from '../notifications/notifications.service';
import { TweetResponse } from '../tweets/tweets.service';

export const TIMELINE_NEW_TWEET_EVENT = 'timeline:new-tweet';
export const NOTIFICATION_NEW_EVENT = 'notification:new';

@Injectable()
@WebSocketGateway({
  namespace: '/events',
  cors: {
    origin: true,
    credentials: true,
  },
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(EventsGateway.name);
  private readonly userSocketIds = new Map<string, Set<string>>();

  @WebSocketServer()
  server!: Server;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectRepository(Follow)
    private readonly followRepository: Repository<Follow>,
  ) {}

  async handleConnection(client: Socket): Promise<void> {
    const userId = await this.authenticateClient(client);
    if (!userId) {
      client.disconnect(true);
      return;
    }

    client.data.userId = userId;
    this.registerSocket(userId, client.id);
    this.logger.debug(`Client connected: ${client.id} (user ${userId})`);
  }

  handleDisconnect(client: Socket): void {
    const userId = client.data.userId as string | undefined;
    if (userId) {
      this.unregisterSocket(userId, client.id);
      this.logger.debug(`Client disconnected: ${client.id} (user ${userId})`);
    }
  }

  async emitTimelineNewTweet(
    authorId: string,
    tweet: TweetResponse,
  ): Promise<void> {
    const follows = await this.followRepository.find({
      where: { followingId: authorId },
      select: { followerId: true },
    });

    const payload = this.serializeTweet(tweet);

    for (const { followerId } of follows) {
      this.emitToUser(followerId, TIMELINE_NEW_TWEET_EVENT, payload);
    }
  }

  emitNotification(
    recipientId: string,
    notification: NotificationResponse,
  ): void {
    this.emitToUser(
      recipientId,
      NOTIFICATION_NEW_EVENT,
      this.serializeNotification(notification),
    );
  }

  private async authenticateClient(client: Socket): Promise<string | null> {
    try {
      const token = this.extractToken(client);
      if (!token) return null;

      const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: this.configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
      });

      return payload.sub;
    } catch {
      return null;
    }
  }

  private extractToken(client: Socket): string | null {
    const auth = client.handshake.auth as Record<string, unknown> | undefined;
    const authToken = auth?.token;
    if (typeof authToken === 'string' && authToken.length > 0) {
      return authToken;
    }

    const header = client.handshake.headers.authorization;
    if (typeof header === 'string' && header.startsWith('Bearer ')) {
      return header.slice(7);
    }

    return null;
  }

  private registerSocket(userId: string, socketId: string): void {
    const sockets = this.userSocketIds.get(userId) ?? new Set<string>();
    sockets.add(socketId);
    this.userSocketIds.set(userId, sockets);
  }

  private unregisterSocket(userId: string, socketId: string): void {
    const sockets = this.userSocketIds.get(userId);
    if (!sockets) return;

    sockets.delete(socketId);
    if (sockets.size === 0) {
      this.userSocketIds.delete(userId);
    }
  }

  private emitToUser(userId: string, event: string, payload: unknown): void {
    const socketIds = this.userSocketIds.get(userId);
    if (!socketIds || socketIds.size === 0) return;

    for (const socketId of socketIds) {
      this.server.to(socketId).emit(event, payload);
    }
  }

  private serializeTweet(tweet: TweetResponse) {
    return {
      ...tweet,
      createdAt: tweet.createdAt.toISOString(),
      updatedAt: tweet.updatedAt.toISOString(),
    };
  }

  private serializeNotification(notification: NotificationResponse) {
    return {
      ...notification,
      readAt: notification.readAt?.toISOString() ?? null,
      createdAt: notification.createdAt.toISOString(),
    };
  }
}
