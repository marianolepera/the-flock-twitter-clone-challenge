import { Controller, Get, Param, Query } from '@nestjs/common';
import { ListUsersDto } from './dto/list-users.dto';
import { SearchUsersDto } from './dto/search-users.dto';
import { UsersService } from './users.service';

@Controller('users')
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
}
