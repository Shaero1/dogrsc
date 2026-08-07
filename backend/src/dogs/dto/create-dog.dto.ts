import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DogStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsObject,
  IsOptional,
  IsString,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { DogDescriptions } from '../dog-descriptions.types';

export class DogLocaleContentRequiredDto {
  @ApiProperty({ example: 'Luna' })
  @IsString()
  @MinLength(1)
  name!: string;

  @ApiProperty({ example: 'Friendly mixed-breed looking for a calm home.' })
  @IsString()
  @MinLength(1)
  description!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  rescueStory?: string;
}

export class DogLocaleContentOptionalDto {
  @ApiPropertyOptional({ example: 'Luna' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  rescueStory?: string;
}

export class DogDescriptionsDto {
  @ApiProperty({ type: DogLocaleContentRequiredDto })
  @ValidateNested()
  @Type(() => DogLocaleContentRequiredDto)
  en!: DogLocaleContentRequiredDto;

  @ApiPropertyOptional({ type: DogLocaleContentOptionalDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => DogLocaleContentOptionalDto)
  th?: DogLocaleContentOptionalDto;

  @ApiPropertyOptional({ type: DogLocaleContentOptionalDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => DogLocaleContentOptionalDto)
  ru?: DogLocaleContentOptionalDto;
}

export class CreateDogDto {
  @ApiProperty({ type: DogDescriptionsDto })
  @ValidateNested()
  @Type(() => DogDescriptionsDto)
  descriptions!: DogDescriptionsDto;

  @IsOptional()
  @IsObject()
  seo?: Record<string, unknown>;

  @ApiPropertyOptional({ example: 'luna' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  slug?: string;

  @ApiPropertyOptional({ enum: DogStatus, default: DogStatus.IN_CARE })
  @IsOptional()
  @IsEnum(DogStatus)
  status?: DogStatus;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}

export class UpdateDogDto {
  @ApiPropertyOptional({ type: DogDescriptionsDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => DogDescriptionsDto)
  descriptions?: DogDescriptionsDto;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  seo?: Record<string, unknown>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(1)
  slug?: string;

  @ApiPropertyOptional({ enum: DogStatus })
  @IsOptional()
  @IsEnum(DogStatus)
  status?: DogStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}

export type { DogDescriptions };
