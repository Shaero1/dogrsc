import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdateCryptoAddressDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(10)
  address?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(64)
  label?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Show on public donate page (only one per currency)',
  })
  @IsOptional()
  @IsBoolean()
  isDisplayed?: boolean;
}
