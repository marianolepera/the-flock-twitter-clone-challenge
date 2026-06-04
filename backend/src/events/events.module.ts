import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { Follow } from '../follows/entities/follow.entity';
import { EventsGateway } from './events.gateway';

@Module({
  imports: [AuthModule, TypeOrmModule.forFeature([Follow])],
  providers: [EventsGateway],
  exports: [EventsGateway],
})
export class EventsModule {}
