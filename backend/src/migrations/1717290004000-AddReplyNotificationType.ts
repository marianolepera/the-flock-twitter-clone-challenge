import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddReplyNotificationType1717290004000 implements MigrationInterface {
  name = 'AddReplyNotificationType1717290004000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "notifications" DROP CONSTRAINT IF EXISTS "CHK_notifications_type"',
    );
    await queryRunner.query(
      'ALTER TABLE "notifications" DROP CONSTRAINT IF EXISTS "CHK_notifications_tweet_for_like"',
    );
    await queryRunner.query(`
      ALTER TABLE "notifications"
      ADD CONSTRAINT "CHK_notifications_type"
      CHECK ("type" IN ('follow', 'like', 'reply'))
    `);
    await queryRunner.query(`
      ALTER TABLE "notifications"
      ADD CONSTRAINT "CHK_notifications_tweet_for_reply"
      CHECK (
        ("type" IN ('like', 'reply') AND "tweetId" IS NOT NULL)
        OR ("type" = 'follow' AND "tweetId" IS NULL)
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "notifications" DROP CONSTRAINT IF EXISTS "CHK_notifications_tweet_for_reply"',
    );
    await queryRunner.query(
      'ALTER TABLE "notifications" DROP CONSTRAINT IF EXISTS "CHK_notifications_type"',
    );
    await queryRunner.query(`
      ALTER TABLE "notifications"
      ADD CONSTRAINT "CHK_notifications_type"
      CHECK ("type" IN ('follow', 'like'))
    `);
    await queryRunner.query(`
      ALTER TABLE "notifications"
      ADD CONSTRAINT "CHK_notifications_tweet_for_like"
      CHECK (
        ("type" = 'like' AND "tweetId" IS NOT NULL)
        OR ("type" = 'follow' AND "tweetId" IS NULL)
      )
    `);
  }
}
