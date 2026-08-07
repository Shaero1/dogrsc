import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentMethod } from '@prisma/client';
import {
  IsEmail,
  IsEnum,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateDonationPublicDto {
  @ApiProperty({ example: 1000 })
  @IsNumber()
  @IsPositive()
  amount!: number;

  @ApiProperty({ example: 'Somchai' })
  @IsString()
  @MinLength(1)
  donorName!: string;

  @ApiProperty({ example: 'donor@example.com' })
  @IsEmail()
  donorEmail!: string;

  @ApiProperty({ enum: PaymentMethod })
  @IsEnum(PaymentMethod)
  paymentMethod!: PaymentMethod;

  @ApiPropertyOptional({ default: 'THB' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiProperty({ description: 'Cloudflare Turnstile token' })
  @IsString()
  @MinLength(1)
  captchaToken!: string;
}
