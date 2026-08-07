import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DonationStatus, PaymentMethod } from '@prisma/client';
import {
  IsEmail,
  IsEnum,
  IsIn,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateDonationAdminDto {
  @ApiProperty({ example: 1000 })
  @IsNumber()
  @IsPositive()
  amount!: number;

  @ApiPropertyOptional({ example: 'Somchai' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  donorName?: string;

  @ApiPropertyOptional({ example: 'donor@example.com' })
  @IsOptional()
  @IsEmail()
  donorEmail?: string;

  @ApiPropertyOptional({ enum: PaymentMethod })
  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;

  @ApiPropertyOptional({ default: 'THB' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({ enum: DonationStatus, default: DonationStatus.PENDING })
  @IsOptional()
  @IsIn([DonationStatus.PENDING, DonationStatus.CONFIRMED])
  status?: DonationStatus;
}
