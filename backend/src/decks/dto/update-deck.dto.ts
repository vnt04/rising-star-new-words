import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateDeckDto {
  @IsString()
  @IsOptional()
  @MaxLength(200)
  title?: string;

  @IsString()
  @IsOptional()
  @MaxLength(2000)
  description?: string;
}
