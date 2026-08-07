import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DonationStatus, PaymentMethod } from '@prisma/client';

export class DonationResponseDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ example: '1000.00' })
  amount!: string;

  @ApiProperty({ example: 'THB' })
  currency!: string;

  @ApiProperty({ enum: DonationStatus })
  status!: DonationStatus;

  @ApiPropertyOptional({ enum: PaymentMethod })
  paymentMethod?: PaymentMethod | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  donorName?: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  donorEmail?: string | null;

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  updatedAt!: string;
}

export class PaginatedDonationsResponseDto {
  @ApiProperty({ type: [DonationResponseDto] })
  items!: DonationResponseDto[];

  @ApiProperty()
  total!: number;

  @ApiProperty()
  page!: number;

  @ApiProperty()
  limit!: number;
}
