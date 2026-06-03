import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import dataSource from '../src/database/data-source';
import { createE2eApp } from './helpers/e2e-app';

const PASSWORD = 'Password123!';

describe('Auth API (e2e)', () => {
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

  it('register -> login -> profile -> refresh rotates token', async () => {
    const server = app.getHttpServer();
    const suffix = Date.now();

    const registerRes = await request(server)
      .post('/auth/register')
      .send({
        email: `alice-${suffix}@example.com`,
        username: `alice${suffix}`,
        password: PASSWORD,
      });
    expect(registerRes.status).toBe(201);
    expect(registerRes.body).toHaveProperty('accessToken');
    expect(registerRes.body).toHaveProperty('refreshToken');

    const loginRes = await request(server)
      .post('/auth/login')
      .send({
        email: `alice-${suffix}@example.com`,
        password: PASSWORD,
      });
    expect(loginRes.status).toBe(200);
    const accessToken = loginRes.body.accessToken as string;
    const refreshToken = loginRes.body.refreshToken as string;
    const username = loginRes.body.user.username as string;

    const profileRes = await request(server)
      .get(`/users/${username}`)
      .set('Authorization', `Bearer ${accessToken}`);
    expect(profileRes.status).toBe(200);
    expect(profileRes.body).toHaveProperty('username', username);

    const refreshRes = await request(server)
      .post('/auth/refresh')
      .send({ refreshToken });
    expect(refreshRes.status).toBe(200);
    expect(refreshRes.body).toHaveProperty('accessToken');
    expect(refreshRes.body).toHaveProperty('refreshToken');
    const rotatedRefreshToken = refreshRes.body.refreshToken as string;
    expect(rotatedRefreshToken).not.toBe(refreshToken);

    const logoutRes = await request(server)
      .post('/auth/logout')
      .send({ refreshToken: rotatedRefreshToken });
    expect(logoutRes.status).toBe(204);
  });

  it('rejects weak password on register', async () => {
    const server = app.getHttpServer();
    const res = await request(server).post('/auth/register').send({
      email: 'weak@test.com',
      username: 'weakuser',
      password: 'weak',
    });
    expect(res.status).toBe(400);
  });
});
