import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddNotifications1717290002000 implements MigrationInterface {
  name = 'AddNotifications1717290002000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "notifications" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "recipientId" uuid NOT NULL,
        "actorId" uuid NOT NULL,
        "type" character varying(20) NOT NULL,
        "tweetId" uuid,
        "readAt" TIMESTAMPTZ,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_notifications_id" PRIMARY KEY ("id"),
        CONSTRAINT "CHK_notifications_type" CHECK ("type" IN ('follow', 'like')),
        CONSTRAINT "CHK_notifications_tweet_for_like" CHECK (
          ("type" = 'like' AND "tweetId" IS NOT NULL)
          OR ("type" = 'follow' AND "tweetId" IS NULL)
        ),
        CONSTRAINT "FK_notifications_recipient" FOREIGN KEY ("recipientId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
        CONSTRAINT "FK_notifications_actor" FOREIGN KEY ("actorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
        CONSTRAINT "FK_notifications_tweet" FOREIGN KEY ("tweetId") REFERENCES "tweets"("id") ON DELETE CASCADE ON UPDATE NO ACTION
      )
    `);

    await queryRunner.query(
      'CREATE INDEX "IDX_notifications_recipientId_createdAt" ON "notifications" ("recipientId", "createdAt" DESC)',
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_notifications_recipientId_readAt" ON "notifications" ("recipientId", "readAt")',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'DROP INDEX IF EXISTS "IDX_notifications_recipientId_readAt"',
    );
    await queryRunner.query(
      'DROP INDEX IF EXISTS "IDX_notifications_recipientId_createdAt"',
    );
    await queryRunner.query('DROP TABLE IF EXISTS "notifications"');
  }
}
