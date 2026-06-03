import { Transform } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class TimelineQueryDto {
  @IsOptional()
  @IsString()
  cursor?: string;

  @IsOptional()
  @Transform(({ value }) =>
    value === undefined ? undefined : parseInt(value, 10),
  )
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number;
}
