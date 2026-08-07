import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
} from 'class-validator';

export class CreateReportDto {
  @ApiProperty({ example: 'Somchai' })
  @IsString()
  @MinLength(1)
  reporterName!: string;

  @ApiProperty({ example: '+66812345678' })
  @IsString()
  @MinLength(5)
  reporterPhone!: string;

  @ApiPropertyOptional({ example: 'reporter@example.com' })
  @IsOptional()
  @IsEmail()
  reporterEmail?: string;

  @ApiProperty({ example: 'Small brown dog near the market.' })
  @IsString()
  @MinLength(10)
  description!: string;

  @ApiPropertyOptional({ example: 13.7563 })
  @IsOptional()
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude?: number;

  @ApiPropertyOptional({ example: 100.5018 })
  @IsOptional()
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude?: number;

  @ApiProperty({ description: 'Cloudflare Turnstile token' })
  @IsString()
  @MinLength(1)
  captchaToken!: string;
}
