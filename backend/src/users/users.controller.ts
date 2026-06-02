import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PaginationDto } from '../common/dto/pagination.dto';
import { FollowsService } from '../follows/follows.service';
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
  constructor(
    private readonly usersService: UsersService,
    private readonly followsService: FollowsService,
  ) {}

  @Get()
  list(@Query() query: ListUsersDto) {
    return this.usersService.list(query.page, query.limit);
  }

  @Get('search')
  search(@Query() query: SearchUsersDto) {
    return this.usersService.search(query.q, query.limit);
  }

  @Post(':username/follow')
  @HttpCode(HttpStatus.CREATED)
  follow(@Request() req: AuthRequest, @Param('username') username: string) {
    return this.followsService.follow(req.user.id, username);
  }

  @Delete(':username/follow')
  @HttpCode(HttpStatus.NO_CONTENT)
  async unfollow(
    @Request() req: AuthRequest,
    @Param('username') username: string,
  ) {
    await this.followsService.unfollow(req.user.id, username);
  }

  @Get(':username/followers')
  getFollowers(
    @Param('username') username: string,
    @Query() query: PaginationDto,
  ) {
    return this.followsService.getFollowers(username, query.page, query.limit);
  }

  @Get(':username/following')
  getFollowing(
    @Param('username') username: string,
    @Query() query: PaginationDto,
  ) {
    return this.followsService.getFollowing(username, query.page, query.limit);
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
