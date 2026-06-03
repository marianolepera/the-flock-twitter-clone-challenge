import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import dataSource from '../src/database/data-source';
import type { TweetResponse } from '../src/tweets/tweets.service';
import { createE2eApp } from './helpers/e2e-app';

type TimelineFeedResponse = {
  items: TweetResponse[];
  hasMore: boolean;
  nextCursor: string | null;
};

const PASSWORD = 'Password123!';

describe('Social API (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    if (!dataSource.isInitialized) {
      await dataSource.initialize();
    }
    await dataSource.dropDatabase();
    await dataSource.runMigrations({ transaction: 'all' });
  });

  beforeEach(async () => {
    app = await createE2eApp();
  });

  afterEach(async () => {
    await app?.close();
  });

  afterAll(async () => {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
  });

  it('follow, tweet, timeline and like flow', async () => {
    const server = app.getHttpServer();
    const suffix = Date.now();

    const aliceReg = await request(server)
      .post('/auth/register')
      .send({
        email: `alice-${suffix}@test.com`,
        username: `alice${suffix}`,
        password: PASSWORD,
      });
    expect(aliceReg.status).toBe(201);
    const aliceToken = aliceReg.body.accessToken as string;

    const bobReg = await request(server)
      .post('/auth/register')
      .send({
        email: `bob-${suffix}@test.com`,
        username: `bob${suffix}`,
        password: PASSWORD,
      });
    expect(bobReg.status).toBe(201);
    const bobToken = bobReg.body.accessToken as string;
    const bobUsername = bobReg.body.user.username as string;

    const followRes = await request(server)
      .post(`/users/${bobUsername}/follow`)
      .set('Authorization', `Bearer ${aliceToken}`);
    expect(followRes.status).toBe(201);
    expect(followRes.body).toEqual({ following: true });

    const tweetRes = await request(server)
      .post('/tweets')
      .set('Authorization', `Bearer ${bobToken}`)
      .send({ content: 'Hello from Bob in e2e!' });
    expect(tweetRes.status).toBe(201);
    const tweetId = tweetRes.body.id as string;

    const timelineRes = await request(server)
      .get('/timeline?limit=20')
      .set('Authorization', `Bearer ${aliceToken}`);
    expect(timelineRes.status).toBe(200);
    const timelineBody = timelineRes.body as TimelineFeedResponse;
    expect(timelineBody.items.length).toBeGreaterThanOrEqual(1);
    const bobTweet = timelineBody.items.find((t) => t.id === tweetId);
    expect(bobTweet).toEqual(
      expect.objectContaining({ content: 'Hello from Bob in e2e!' }),
    );

    const likeRes = await request(server)
      .post(`/tweets/${tweetId}/like`)
      .set('Authorization', `Bearer ${aliceToken}`);
    expect(likeRes.status).toBe(201);
    expect(likeRes.body.likesCount).toBeGreaterThanOrEqual(1);
    expect(likeRes.body.likedByMe).toBe(true);

    const searchRes = await request(server)
      .get(`/users/search?q=${bobUsername.slice(0, 3)}`)
      .set('Authorization', `Bearer ${aliceToken}`);
    expect(searchRes.status).toBe(200);
    expect(
      searchRes.body.some(
        (u: { username: string }) => u.username === bobUsername,
      ),
    ).toBe(true);

    const unfollowRes = await request(server)
      .delete(`/users/${bobUsername}/follow`)
      .set('Authorization', `Bearer ${aliceToken}`);
    expect(unfollowRes.status).toBe(204);
  });

  it('rejects tweet creation without auth', async () => {
    const server = app.getHttpServer();
    const res = await request(server)
      .post('/tweets')
      .send({ content: 'Should fail' });
    expect(res.status).toBe(401);
  });
});
