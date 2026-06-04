import { IsNull, Repository } from 'typeorm';
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
    findAndCount: jest.fn(),
    count: jest.fn(),
    update: jest.fn(),
  };
}

describe('NotificationsService', () => {
  let service: NotificationsService;
  let notificationRepo: MockRepo<Notification>;

  beforeEach(() => {
    notificationRepo = mockRepo<Notification>();
    service = new NotificationsService(
      notificationRepo as unknown as Repository<Notification>,
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

  it('create saves a follow notification', async () => {
    (notificationRepo.create as jest.Mock).mockImplementation((x) => x);
    (notificationRepo.save as jest.Mock).mockResolvedValue({});

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
