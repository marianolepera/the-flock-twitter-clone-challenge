import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddReplies1717290003000 implements MigrationInterface {
  name = 'AddReplies1717290003000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "tweets"
      ADD COLUMN "parentTweetId" uuid
    `);
    await queryRunner.query(`
      ALTER TABLE "tweets"
      ADD CONSTRAINT "FK_tweets_parentTweet"
      FOREIGN KEY ("parentTweetId") REFERENCES "tweets"("id")
      ON DELETE CASCADE ON UPDATE NO ACTION
    `);
    await queryRunner.query(
      'CREATE INDEX "IDX_tweets_parentTweetId" ON "tweets" ("parentTweetId")',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX IF EXISTS "IDX_tweets_parentTweetId"');
    await queryRunner.query(
      'ALTER TABLE "tweets" DROP CONSTRAINT IF EXISTS "FK_tweets_parentTweet"',
    );
    await queryRunner.query(
      'ALTER TABLE "tweets" DROP COLUMN IF EXISTS "parentTweetId"',
    );
  }
}
