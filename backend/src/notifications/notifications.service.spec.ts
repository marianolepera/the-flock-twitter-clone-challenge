import { IsNull, Repository } from 'typeorm';
import { EventsGateway } from '../events/events.gateway';
import { Notification } from './entities/notification.entity';
import { NotificationType } from './entities/notification-type';
import { NotificationsService } from './notifications.service';

type MockRepo<T extends object> = Partial<
  Record<keyof Repository<T>, jest.Mock>
>;

function mockRepo<T extends object>(): MockRepo<T> {
  return {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    findAndCount: jest.fn(),
    count: jest.fn(),
    update: jest.fn(),
  };
}

describe('NotificationsService', () => {
  let service: NotificationsService;
  let notificationRepo: MockRepo<Notification>;
  let emitNotification: jest.Mock;
  let eventsGateway: EventsGateway;

  beforeEach(() => {
    notificationRepo = mockRepo<Notification>();
    emitNotification = jest.fn();
    eventsGateway = {
      emitNotification,
    } as unknown as EventsGateway;
    service = new NotificationsService(
      notificationRepo as unknown as Repository<Notification>,
      eventsGateway,
    );
  });

  it('create skips self notifications', async () => {
    await service.create({
      recipientId: 'u1',
      actorId: 'u1',
      type: NotificationType.FOLLOW,
    });

    expect(notificationRepo.save).not.toHaveBeenCalled();
  });

  it('create saves a follow notification and emits websocket event', async () => {
    const createdAt = new Date('2024-01-01T00:00:00.000Z');
    const saved = { id: 'n1', recipientId: 'u2', actorId: 'u1' };

    (notificationRepo.create as jest.Mock).mockImplementation((x) => x);
    (notificationRepo.save as jest.Mock).mockResolvedValue(saved);
    (notificationRepo.findOne as jest.Mock).mockResolvedValue({
      id: 'n1',
      type: NotificationType.FOLLOW,
      readAt: null,
      createdAt,
      actor: {
        id: 'u1',
        username: 'alice',
        avatarUrl: 'https://example.com/a.png',
      },
      tweet: null,
    });

    await service.create({
      recipientId: 'u2',
      actorId: 'u1',
      type: NotificationType.FOLLOW,
    });

    expect(notificationRepo.create).toHaveBeenCalledWith({
      recipientId: 'u2',
      actorId: 'u1',
      type: NotificationType.FOLLOW,
      tweetId: null,
    });
    expect(notificationRepo.save).toHaveBeenCalled();
    expect(emitNotification).toHaveBeenCalledWith('u2', {
      id: 'n1',
      type: NotificationType.FOLLOW,
      actor: {
        id: 'u1',
        username: 'alice',
        avatarUrl: 'https://example.com/a.png',
      },
      tweet: null,
      readAt: null,
      createdAt,
    });
  });

  it('create saves a like notification with tweetId', async () => {
    const createdAt = new Date('2024-01-01T00:00:00.000Z');
    const saved = { id: 'n2', recipientId: 'u2', actorId: 'u1' };

    (notificationRepo.create as jest.Mock).mockImplementation((x) => x);
    (notificationRepo.save as jest.Mock).mockResolvedValue(saved);
    (notificationRepo.findOne as jest.Mock).mockResolvedValue({
      id: 'n2',
      type: NotificationType.LIKE,
      readAt: null,
      createdAt,
      actor: {
        id: 'u1',
        username: 'alice',
        avatarUrl: 'https://example.com/a.png',
      },
      tweet: { id: 't1', content: 'Nice tweet' },
    });

    await service.create({
      recipientId: 'u2',
      actorId: 'u1',
      type: NotificationType.LIKE,
      tweetId: 't1',
    });

    expect(notificationRepo.create).toHaveBeenCalledWith({
      recipientId: 'u2',
      actorId: 'u1',
      type: NotificationType.LIKE,
      tweetId: 't1',
    });
    expect(emitNotification).toHaveBeenCalledWith(
      'u2',
      expect.objectContaining({
        tweet: { id: 't1', content: 'Nice tweet' },
      }),
    );
  });

  it('createReplyNotification saves a reply notification with tweetId', async () => {
    const createdAt = new Date('2024-01-01T00:00:00.000Z');
    const saved = { id: 'n3', recipientId: 'u2', actorId: 'u1' };

    (notificationRepo.create as jest.Mock).mockImplementation((x) => x);
    (notificationRepo.save as jest.Mock).mockResolvedValue(saved);
    (notificationRepo.findOne as jest.Mock).mockResolvedValue({
      id: 'n3',
      type: NotificationType.REPLY,
      readAt: null,
      createdAt,
      actor: {
        id: 'u1',
        username: 'alice',
        avatarUrl: 'https://example.com/a.png',
      },
      tweet: { id: 't1', content: 'Reply target' },
    });

    await service.createReplyNotification('u2', 'u1', 't1');

    expect(notificationRepo.create).toHaveBeenCalledWith({
      recipientId: 'u2',
      actorId: 'u1',
      type: NotificationType.REPLY,
      tweetId: 't1',
    });
    expect(emitNotification).toHaveBeenCalledWith(
      'u2',
      expect.objectContaining({
        type: NotificationType.REPLY,
        tweet: { id: 't1', content: 'Reply target' },
      }),
    );
  });

  it('create does not emit when loaded notification is missing', async () => {
    (notificationRepo.create as jest.Mock).mockImplementation((x) => x);
    (notificationRepo.save as jest.Mock).mockResolvedValue({ id: 'n1' });
    (notificationRepo.findOne as jest.Mock).mockResolvedValue(null);

    await service.create({
      recipientId: 'u2',
      actorId: 'u1',
      type: NotificationType.FOLLOW,
    });

    expect(emitNotification).not.toHaveBeenCalled();
  });

  it('create saves a like notification without tweetId as null', async () => {
    (notificationRepo.create as jest.Mock).mockImplementation((x) => x);
    (notificationRepo.save as jest.Mock).mockResolvedValue({ id: 'n3' });
    (notificationRepo.findOne as jest.Mock).mockResolvedValue(null);

    await service.create({
      recipientId: 'u2',
      actorId: 'u1',
      type: NotificationType.LIKE,
    });

    expect(notificationRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({ tweetId: null }),
    );
  });

  it('findAll returns paginated notifications', async () => {
    const createdAt = new Date('2024-01-01T00:00:00.000Z');
    (notificationRepo.findAndCount as jest.Mock).mockResolvedValue([
      [
        {
          id: 'n1',
          type: NotificationType.LIKE,
          readAt: null,
          createdAt,
          actor: {
            id: 'u1',
            username: 'alice',
            avatarUrl: 'https://example.com/a.png',
          },
          tweet: { id: 't1', content: 'Hello' },
        },
      ],
      1,
    ]);

    await expect(service.findAll('u2', 2, 5)).resolves.toEqual({
      items: [
        expect.objectContaining({
          id: 'n1',
          type: NotificationType.LIKE,
          tweet: { id: 't1', content: 'Hello' },
        }),
      ],
      total: 1,
      page: 2,
      limit: 5,
    });

    expect(notificationRepo.findAndCount).toHaveBeenCalledWith({
      where: { recipientId: 'u2' },
      relations: ['actor', 'tweet'],
      order: { createdAt: 'DESC' },
      take: 5,
      skip: 5,
    });
  });

  it('unreadCount returns count of unread notifications', async () => {
    (notificationRepo.count as jest.Mock).mockResolvedValue(3);

    await expect(service.unreadCount('u1')).resolves.toEqual({ count: 3 });

    expect(notificationRepo.count).toHaveBeenCalledWith({
      where: { recipientId: 'u1', readAt: IsNull() },
    });
  });

  it('markAllRead updates unread notifications', async () => {
    (notificationRepo.update as jest.Mock).mockResolvedValue({ affected: 2 });

    await expect(service.markAllRead('u1')).resolves.toEqual({ updated: 2 });
  });

  it('markAllRead returns 0 when no rows were affected', async () => {
    (notificationRepo.update as jest.Mock).mockResolvedValue({
      affected: undefined,
    });

    await expect(service.markAllRead('u1')).resolves.toEqual({ updated: 0 });
  });

  it('markOneRead marks an unread notification as read', async () => {
    const createdAt = new Date('2024-01-01T00:00:00.000Z');
    const notification = {
      id: 'n1',
      type: NotificationType.LIKE,
      readAt: null,
      createdAt,
      actor: {
        id: 'u1',
        username: 'alice',
        avatarUrl: 'https://example.com/a.png',
      },
      tweet: { id: 't1', content: 'Hello' },
    };

    (notificationRepo.findOne as jest.Mock).mockResolvedValue(notification);
    (notificationRepo.save as jest.Mock).mockImplementation((n) => n);

    await expect(service.markOneRead('u2', 'n1')).resolves.toEqual(
      expect.objectContaining({
        id: 'n1',
        readAt: expect.any(Date) as Date,
      }),
    );

    expect(notificationRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({ readAt: expect.any(Date) as Date }),
    );
  });

  it('markOneRead returns notification without saving when already read', async () => {
    const readAt = new Date('2024-01-02T00:00:00.000Z');
    const notification = {
      id: 'n1',
      type: NotificationType.FOLLOW,
      readAt,
      createdAt: new Date('2024-01-01T00:00:00.000Z'),
      actor: {
        id: 'u1',
        username: 'alice',
        avatarUrl: 'https://example.com/a.png',
      },
      tweet: null,
    };

    (notificationRepo.findOne as jest.Mock).mockResolvedValue(notification);

    await expect(service.markOneRead('u2', 'n1')).resolves.toEqual(
      expect.objectContaining({ readAt }),
    );

    expect(notificationRepo.save).not.toHaveBeenCalled();
  });

  it('markOneRead throws when notification is not found', async () => {
    (notificationRepo.findOne as jest.Mock).mockResolvedValue(null);

    await expect(service.markOneRead('u2', 'missing')).rejects.toThrow(
      'Notification not found',
    );
  });
});
