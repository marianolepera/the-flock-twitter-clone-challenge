import { IsString, Length } from 'class-validator';

export class CreateTweetDto {
  @IsString()
  @Length(1, 280)
  content: string;
}
