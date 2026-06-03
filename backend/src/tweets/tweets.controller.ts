import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from '../users/entities/user.entity';
import { CreateTweetDto } from './dto/create-tweet.dto';
import { TweetsService } from './tweets.service';

interface AuthRequest extends Request {
  user: User;
}

@Controller('tweets')
@UseGuards(JwtAuthGuard)
export class TweetsController {
  constructor(private readonly tweetsService: TweetsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Request() req: AuthRequest, @Body() dto: CreateTweetDto) {
    return this.tweetsService.create(req.user.id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Request() req: AuthRequest, @Param('id') id: string) {
    await this.tweetsService.delete(id, req.user.id);
  }

  @Post(':id/like')
  @HttpCode(HttpStatus.CREATED)
  like(@Request() req: AuthRequest, @Param('id') id: string) {
    return this.tweetsService.like(id, req.user.id);
  }

  @Delete(':id/like')
  @HttpCode(HttpStatus.NO_CONTENT)
  async unlike(@Request() req: AuthRequest, @Param('id') id: string) {
    await this.tweetsService.unlike(id, req.user.id);
  }
}
