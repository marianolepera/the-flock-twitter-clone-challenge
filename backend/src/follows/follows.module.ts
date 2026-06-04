import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationsModule } from '../notifications/notifications.module';
import { User } from '../users/entities/user.entity';
import { Follow } from './entities/follow.entity';
import { FollowsService } from './follows.service';

@Module({
  imports: [TypeOrmModule.forFeature([Follow, User]), NotificationsModule],
  providers: [FollowsService],
  exports: [FollowsService],
})
export class FollowsModule {}
