import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Follow } from '../follows/entities/follow.entity';
import { TweetsModule } from '../tweets/tweets.module';
import { Tweet } from '../tweets/entities/tweet.entity';
import { TimelineController } from './timeline.controller';
import { TimelineService } from './timeline.service';

@Module({
  imports: [TypeOrmModule.forFeature([Tweet, Follow]), TweetsModule],
  controllers: [TimelineController],
  providers: [TimelineService],
})
export class TimelineModule {}
