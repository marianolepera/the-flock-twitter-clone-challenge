import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PaginationDto } from '../common/dto/pagination.dto';
import { User } from '../users/entities/user.entity';
import { NotificationsService } from './notifications.service';

interface AuthRequest extends Request {
  user: User;
}

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  list(@Request() req: AuthRequest, @Query() query: PaginationDto) {
    return this.notificationsService.findAll(
      req.user.id,
      query.page,
      query.limit,
    );
  }

  @Get('unread-count')
  unreadCount(@Request() req: AuthRequest) {
    return this.notificationsService.unreadCount(req.user.id);
  }

  @Patch('read')
  @HttpCode(HttpStatus.OK)
  markAllRead(@Request() req: AuthRequest) {
    return this.notificationsService.markAllRead(req.user.id);
  }
}
