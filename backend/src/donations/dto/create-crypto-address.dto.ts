import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateCryptoAddressDto {
  @ApiProperty({ example: 'BTC', description: 'Currency ticker (2-10 alphanumeric)' })
  @Transform(({ value }: { value: string }) =>
    typeof value === 'string' ? value.trim().toUpperCase() : value,
  )
  @IsString()
  @Matches(/^[A-Z0-9]{2,10}$/)
  currencyCode!: string;

  @ApiPropertyOptional({ example: 'Bitcoin' })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  label?: string;

  @ApiProperty({ example: 'bc1qexampleaddressfordevonly000000000' })
  @IsString()
  @MinLength(10)
  address!: string;

  @ApiPropertyOptional({
    description: 'Show this address on the public donate page (replaces current displayed address for this currency)',
  })
  @IsOptional()
  @IsBoolean()
  setAsDisplayed?: boolean;
}
