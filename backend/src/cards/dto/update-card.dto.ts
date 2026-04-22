import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateCardDto {
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  front?: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  back?: string;

  @IsString()
  @IsOptional()
  @MaxLength(2000)
  example?: string;
}
