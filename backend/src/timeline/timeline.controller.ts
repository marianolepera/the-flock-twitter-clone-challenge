import { Controller, Get, Query, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from '../users/entities/user.entity';
import { TimelineQueryDto } from './dto/timeline-query.dto';
import { TimelineService } from './timeline.service';

interface AuthRequest extends Request {
  user: User;
}

@Controller('timeline')
@UseGuards(JwtAuthGuard)
export class TimelineController {
  constructor(private readonly timelineService: TimelineService) {}

  @Get()
  getFeed(@Request() req: AuthRequest, @Query() query: TimelineQueryDto) {
    return this.timelineService.getFeed(req.user.id, query.cursor, query.limit);
  }
}
