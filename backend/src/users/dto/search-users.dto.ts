import { IsInt, IsOptional, IsString, Length, Max, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class SearchUsersDto {
  @IsString()
  @Length(1, 50)
  q: string;

  @IsOptional()
  @Transform(({ value }) =>
    value === undefined ? undefined : parseInt(value, 10),
  )
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number;
}
