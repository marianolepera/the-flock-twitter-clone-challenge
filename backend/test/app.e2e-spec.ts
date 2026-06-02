import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import dataSource from '../src/database/data-source';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    if (!dataSource.isInitialized) {
      await dataSource.initialize();
    }
    await dataSource.dropDatabase();
    await dataSource.runMigrations({ transaction: 'all' });
    await dataSource.query(
      'TRUNCATE TABLE "refresh_tokens", "likes", "follows", "tweets", "users" RESTART IDENTITY CASCADE',
    );
  });

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('register -> login -> me -> refresh rotates token', async () => {
    const server = app.getHttpServer();

    const registerRes = await request(server).post('/auth/register').send({
      email: 'alice@example.com',
      username: 'alice',
      password: 'password123',
    });
    expect(registerRes.status).toBe(201);
    expect(registerRes.body).toHaveProperty('accessToken');
    expect(registerRes.body).toHaveProperty('refreshToken');

    const loginRes = await request(server).post('/auth/login').send({
      email: 'alice@example.com',
      password: 'password123',
    });
    expect(loginRes.status).toBe(200);
    const accessToken = loginRes.body.accessToken as string;
    const refreshToken = loginRes.body.refreshToken as string;

    const meRes = await request(server)
      .get('/auth/me')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(meRes.status).toBe(200);
    expect(meRes.body).toHaveProperty('id');
    expect(meRes.body).toHaveProperty('username', 'alice');

    const refreshRes = await request(server)
      .post('/auth/refresh')
      .send({ refreshToken });
    expect(refreshRes.status).toBe(200);
    expect(refreshRes.body).toHaveProperty('accessToken');
    expect(refreshRes.body).toHaveProperty('refreshToken');
    expect(refreshRes.body.refreshToken).not.toBe(refreshToken);
  });

  afterEach(async () => {
    await app?.close();
  });

  afterAll(async () => {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
  });
});
