import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CryptoAddressPublicDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ example: 'BTC' })
  currencyCode!: string;

  @ApiPropertyOptional({ example: 'Bitcoin' })
  label?: string | null;

  @ApiProperty()
  address!: string;
}

export class CryptoAddressesPublicResponseDto {
  @ApiProperty({ type: [CryptoAddressPublicDto] })
  items!: CryptoAddressPublicDto[];
}

export class CryptoAddressAdminDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ example: 'BTC' })
  currencyCode!: string;

  @ApiPropertyOptional({ example: 'Bitcoin' })
  label?: string | null;

  @ApiProperty()
  address!: string;

  @ApiProperty()
  isActive!: boolean;

  @ApiProperty()
  isDisplayed!: boolean;

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  updatedAt!: string;
}

export class CryptoAddressesAdminResponseDto {
  @ApiProperty({ type: [CryptoAddressAdminDto] })
  items!: CryptoAddressAdminDto[];
}
