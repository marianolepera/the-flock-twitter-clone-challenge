import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from './entities/user.entity';
import { ListUsersDto } from './dto/list-users.dto';
import { SearchUsersDto } from './dto/search-users.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UsersService } from './users.service';

interface AuthRequest extends Request {
  user: User;
}

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  list(@Query() query: ListUsersDto) {
    return this.usersService.list(query.page, query.limit);
  }

  @Get('search')
  search(@Query() query: SearchUsersDto) {
    return this.usersService.search(query.q, query.limit);
  }

  @Get(':username')
  getProfile(@Param('username') username: string) {
    return this.usersService.getProfileByUsername(username);
  }

  @Patch(':username')
  updateProfile(
    @Request() req: AuthRequest,
    @Param('username') username: string,
    @Body() dto: UpdateProfileDto,
  ) {
    if (req.user.username !== username) {
      throw new ForbiddenException('You can only update your own profile');
    }
    return this.usersService.updateProfile(req.user.id, dto);
  }
}
