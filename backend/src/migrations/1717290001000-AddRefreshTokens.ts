import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRefreshTokens1717290001000 implements MigrationInterface {
  name = 'AddRefreshTokens1717290001000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "refresh_tokens" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "userId" uuid NOT NULL,
        "tokenHash" character varying NOT NULL,
        "expiresAt" TIMESTAMPTZ NOT NULL,
        "revokedAt" TIMESTAMPTZ,
        "replacedByTokenId" uuid,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_refresh_tokens_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_refresh_tokens_user" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(
      'CREATE INDEX "IDX_refresh_tokens_userId" ON "refresh_tokens" ("userId")',
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_refresh_tokens_expiresAt" ON "refresh_tokens" ("expiresAt")',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'DROP INDEX IF EXISTS "IDX_refresh_tokens_expiresAt"',
    );
    await queryRunner.query('DROP INDEX IF EXISTS "IDX_refresh_tokens_userId"');
    await queryRunner.query('DROP TABLE IF EXISTS "refresh_tokens"');
  }
}
