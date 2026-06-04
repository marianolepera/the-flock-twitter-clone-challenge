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
  let eventsGateway: { emitNotification: jest.Mock };

  beforeEach(() => {
    notificationRepo = mockRepo<Notification>();
    eventsGateway = { emitNotification: jest.fn() };
    service = new NotificationsService(
      notificationRepo as unknown as Repository<Notification>,
      eventsGateway as unknown as EventsGateway,
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
    expect(eventsGateway.emitNotification).toHaveBeenCalledWith(
      'u2',
      expect.objectContaining({
        id: 'n1',
        type: NotificationType.FOLLOW,
        actor: expect.objectContaining({ username: 'alice' }),
      }),
    );
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
});
