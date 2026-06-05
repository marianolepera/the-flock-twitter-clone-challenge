import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTweetImageUrl1717290005000 implements MigrationInterface {
  name = 'AddTweetImageUrl1717290005000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "tweets" ADD COLUMN "imageUrl" varchar NULL',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "tweets" DROP COLUMN IF EXISTS "imageUrl"',
    );
  }
}
