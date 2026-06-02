import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitSchema1717290000000 implements MigrationInterface {
  name = 'InitSchema1717290000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "email" character varying NOT NULL,
        "username" character varying(30) NOT NULL,
        "passwordHash" character varying NOT NULL,
        "bio" character varying NOT NULL DEFAULT '',
        "avatarUrl" character varying NOT NULL DEFAULT 'https://api.dicebear.com/7.x/initials/svg?seed=default',
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_users_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_users_email" UNIQUE ("email"),
        CONSTRAINT "UQ_users_username" UNIQUE ("username")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "tweets" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "content" character varying(280) NOT NULL,
        "authorId" uuid NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_tweets_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_tweets_author" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "follows" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "followerId" uuid NOT NULL,
        "followingId" uuid NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_follows_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_follows_follower_following" UNIQUE ("followerId", "followingId"),
        CONSTRAINT "FK_follows_follower" FOREIGN KEY ("followerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
        CONSTRAINT "FK_follows_following" FOREIGN KEY ("followingId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "likes" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "userId" uuid NOT NULL,
        "tweetId" uuid NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_likes_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_likes_user_tweet" UNIQUE ("userId", "tweetId"),
        CONSTRAINT "FK_likes_user" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
        CONSTRAINT "FK_likes_tweet" FOREIGN KEY ("tweetId") REFERENCES "tweets"("id") ON DELETE CASCADE ON UPDATE NO ACTION
      )
    `);

    await queryRunner.query('CREATE INDEX "IDX_tweets_authorId_createdAt" ON "tweets" ("authorId", "createdAt")');
    await queryRunner.query('CREATE INDEX "IDX_tweets_createdAt" ON "tweets" ("createdAt")');
    await queryRunner.query('CREATE INDEX "IDX_follows_followerId" ON "follows" ("followerId")');
    await queryRunner.query('CREATE INDEX "IDX_follows_followingId" ON "follows" ("followingId")');
    await queryRunner.query('CREATE INDEX "IDX_likes_tweetId" ON "likes" ("tweetId")');
    await queryRunner.query('CREATE INDEX "IDX_likes_userId" ON "likes" ("userId")');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX IF EXISTS "IDX_likes_userId"');
    await queryRunner.query('DROP INDEX IF EXISTS "IDX_likes_tweetId"');
    await queryRunner.query('DROP INDEX IF EXISTS "IDX_follows_followingId"');
    await queryRunner.query('DROP INDEX IF EXISTS "IDX_follows_followerId"');
    await queryRunner.query('DROP INDEX IF EXISTS "IDX_tweets_createdAt"');
    await queryRunner.query('DROP INDEX IF EXISTS "IDX_tweets_authorId_createdAt"');

    await queryRunner.query('DROP TABLE IF EXISTS "likes"');
    await queryRunner.query('DROP TABLE IF EXISTS "follows"');
    await queryRunner.query('DROP TABLE IF EXISTS "tweets"');
    await queryRunner.query('DROP TABLE IF EXISTS "users"');
  }
}

