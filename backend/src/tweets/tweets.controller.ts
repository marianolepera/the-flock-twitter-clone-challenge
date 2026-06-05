import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from '../users/entities/user.entity';
import { CreateTweetDto } from './dto/create-tweet.dto';
import { TweetsService } from './tweets.service';
import type { UploadedTweetImage } from './tweet-media.storage';

interface AuthRequest extends Request {
  user: User;
}

const IMAGE_MIME_PATTERN = /^image\/(jpeg|png|gif|webp)$/;

@Controller('tweets')
@UseGuards(JwtAuthGuard)
export class TweetsController {
  constructor(private readonly tweetsService: TweetsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(
    FileInterceptor('image', {
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (_req, file, callback) => {
        callback(null, IMAGE_MIME_PATTERN.test(file.mimetype));
      },
    }),
  )
  create(
    @Request() req: AuthRequest,
    @Body() dto: CreateTweetDto,
    @UploadedFile() file?: UploadedTweetImage,
  ) {
    return this.tweetsService.create(req.user.id, dto, file);
  }

  @Get(':id/thread')
  getThread(@Request() req: AuthRequest, @Param('id') id: string) {
    return this.tweetsService.getThread(id, req.user.id);
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
