import { IsOptional, IsString, IsUUID, Length } from 'class-validator';

export class CreateTweetDto {
  @IsString()
  @Length(1, 280)
  content: string;

  @IsOptional()
  @IsUUID()
  parentTweetId?: string;
}
