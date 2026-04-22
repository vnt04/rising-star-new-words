import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreateCardDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  front!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  back!: string;

  @IsString()
  @IsOptional()
  @MaxLength(2000)
  example?: string;

  @IsUUID()
  deckId!: string;
}
