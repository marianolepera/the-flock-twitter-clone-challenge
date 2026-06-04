import 'dotenv/config';
import { DataSource } from 'typeorm';

import { RefreshToken } from '../auth/entities/refresh-token.entity';
import { Follow } from '../follows/entities/follow.entity';
import { Notification } from '../notifications/entities/notification.entity';
import { Like } from '../tweets/entities/like.entity';
import { Tweet } from '../tweets/entities/tweet.entity';
import { User } from '../users/entities/user.entity';

export default new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST ?? 'localhost',
  port: parseInt(process.env.DATABASE_PORT ?? '5432', 10),
  username: process.env.DATABASE_USER ?? 'postgres',
  password: process.env.DATABASE_PASSWORD ?? 'postgres',
  database: process.env.DATABASE_NAME ?? 'twitter_clone',
  entities: [User, Tweet, Follow, Like, RefreshToken, Notification],
  migrations: ['src/migrations/*.{ts,js}'],
  migrationsTableName: 'migrations',
});
