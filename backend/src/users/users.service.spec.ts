import {
  BadRequestException,
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { PublicProfile, UsersService } from './users.service';

type MockRepo<T extends object> = Partial<
  Record<keyof Repository<T>, jest.Mock>
>;

function mockRepo<T extends object>(): MockRepo<T> {
  return {
    findOne: jest.fn(),
    find: jest.fn(),
    save: jest.fn(),
  };
}

const profile: PublicProfile = {
  id: 'u1',
  email: 'a@a.com',
  username: 'alice',
  bio: '',
  avatarUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=alice',
  createdAt: new Date(),
  updatedAt: new Date(),
};

function mockUser(overrides: Partial<User> = {}): User {
  return {
    id: profile.id,
    email: profile.email,
    username: profile.username,
    passwordHash: 'hashed',
    bio: profile.bio,
    avatarUrl: profile.avatarUrl,
    tweets: [],
    following: [],
    followers: [],
    likes: [],
    createdAt: profile.createdAt,
    updatedAt: profile.updatedAt,
    ...overrides,
  };
}

describe('UsersService', () => {
  let service: UsersService;
  let userRepo: MockRepo<User>;

  beforeEach(() => {
    userRepo = mockRepo<User>();
    service = new UsersService(userRepo as unknown as Repository<User>);
  });

  it('getProfileById throws NotFoundException when user does not exist', async () => {
    (userRepo.findOne as jest.Mock).mockResolvedValue(null);

    await expect(service.getProfileById('missing')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('getProfileById returns public profile fields', async () => {
    (userRepo.findOne as jest.Mock).mockResolvedValue(profile);

    await expect(service.getProfileById('u1')).resolves.toEqual(profile);
  });

  it('updateProfile throws ConflictException when username is taken', async () => {
    (userRepo.findOne as jest.Mock)
      .mockResolvedValueOnce(mockUser())
      .mockResolvedValueOnce(mockUser({ id: 'u2', username: 'bob' }));

    await expect(
      service.updateProfile('u1', { username: 'bob' }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('updateProfile updates bio and returns profile', async () => {
    const user = mockUser();
    const updatedProfile: PublicProfile = { ...profile, bio: 'Hello world' };
    (userRepo.findOne as jest.Mock)
      .mockResolvedValueOnce(user)
      .mockResolvedValueOnce(updatedProfile);
    (userRepo.save as jest.Mock).mockImplementation((u: User) =>
      Promise.resolve(u),
    );

    await expect(
      service.updateProfile('u1', { bio: 'Hello world' }),
    ).resolves.toMatchObject({ bio: 'Hello world' });

    expect(userRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({ bio: 'Hello world' }),
    );
  });

  it('updateProfile requires currentPassword when changing email', async () => {
    (userRepo.findOne as jest.Mock).mockResolvedValueOnce(mockUser());

    await expect(
      service.updateProfile('u1', { email: 'new@a.com' }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('updateProfile rejects invalid currentPassword', async () => {
    const passwordHash = await bcrypt.hash('Password123!', 10);
    (userRepo.findOne as jest.Mock).mockResolvedValueOnce(
      mockUser({ passwordHash }),
    );

    await expect(
      service.updateProfile('u1', {
        newPassword: 'Newpassword123!',
        currentPassword: 'wrong',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('updateProfile updates email with valid currentPassword', async () => {
    const passwordHash = await bcrypt.hash('Password123!', 10);
    const user = mockUser({ passwordHash });
    const updatedProfile: PublicProfile = {
      ...profile,
      email: 'new@a.com',
    };
    (userRepo.findOne as jest.Mock)
      .mockResolvedValueOnce(user)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(updatedProfile);
    (userRepo.save as jest.Mock).mockImplementation((u: User) =>
      Promise.resolve(u),
    );

    await expect(
      service.updateProfile('u1', {
        email: 'new@a.com',
        currentPassword: 'Password123!',
      }),
    ).resolves.toMatchObject({ email: 'new@a.com' });
  });

  it('getProfileByUsername throws NotFoundException when user does not exist', async () => {
    (userRepo.findOne as jest.Mock).mockResolvedValue(null);

    await expect(service.getProfileByUsername('ghost')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('getProfileByUsername returns public profile fields', async () => {
    (userRepo.findOne as jest.Mock).mockResolvedValue(profile);

    await expect(service.getProfileByUsername('alice')).resolves.toEqual(
      profile,
    );
  });

  it('search returns matching users', async () => {
    (userRepo.find as jest.Mock).mockResolvedValue([profile]);

    await expect(service.search('ali', 5)).resolves.toEqual([profile]);
  });

  it('updateProfile throws ConflictException when email is taken', async () => {
    const passwordHash = await bcrypt.hash('Password123!', 10);
    (userRepo.findOne as jest.Mock)
      .mockResolvedValueOnce(mockUser({ passwordHash }))
      .mockResolvedValueOnce({ id: 'u2' });

    await expect(
      service.updateProfile('u1', {
        email: 'taken@a.com',
        currentPassword: 'Password123!',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('updateProfile updates username when available', async () => {
    const user = mockUser();
    const updatedProfile: PublicProfile = { ...profile, username: 'alice2' };
    (userRepo.findOne as jest.Mock)
      .mockResolvedValueOnce(user)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(updatedProfile);
    (userRepo.save as jest.Mock).mockImplementation((u: User) =>
      Promise.resolve(u),
    );

    await expect(
      service.updateProfile('u1', { username: 'alice2' }),
    ).resolves.toMatchObject({ username: 'alice2' });

    expect(userRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({ username: 'alice2' }),
    );
  });

  it('updateProfile updates avatarUrl', async () => {
    const user = mockUser();
    const updatedProfile: PublicProfile = {
      ...profile,
      avatarUrl: 'https://example.com/new.png',
    };
    (userRepo.findOne as jest.Mock)
      .mockResolvedValueOnce(user)
      .mockResolvedValueOnce(updatedProfile);
    (userRepo.save as jest.Mock).mockImplementation((u: User) =>
      Promise.resolve(u),
    );

    await expect(
      service.updateProfile('u1', {
        avatarUrl: 'https://example.com/new.png',
      }),
    ).resolves.toMatchObject({
      avatarUrl: 'https://example.com/new.png',
    });
  });

  it('updateProfile updates password with valid currentPassword', async () => {
    const passwordHash = await bcrypt.hash('Password123!', 10);
    const user = mockUser({ passwordHash });
    (userRepo.findOne as jest.Mock)
      .mockResolvedValueOnce(user)
      .mockResolvedValueOnce(profile);
    (userRepo.save as jest.Mock).mockImplementation((u: User) =>
      Promise.resolve(u),
    );

    await expect(
      service.updateProfile('u1', {
        currentPassword: 'Password123!',
        newPassword: 'Newpassword123!',
      }),
    ).resolves.toMatchObject({ id: 'u1' });

    expect(userRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({
        passwordHash: expect.not.stringMatching(/^hashed$/) as string,
      }),
    );
  });
});
