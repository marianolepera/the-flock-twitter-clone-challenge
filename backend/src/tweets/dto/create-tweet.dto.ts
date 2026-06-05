import { IsOptional, IsString, IsUUID, Length } from 'class-validator';

export class CreateTweetDto {
  @IsOptional()
  @IsString()
  @Length(0, 280)
  content?: string;

  @IsOptional()
  @IsUUID()
  parentTweetId?: string;
}
