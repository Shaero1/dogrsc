import { ApiPropertyOptional } from '@nestjs/swagger';
import { DogStatus } from '@prisma/client';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class DogListQueryDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional({ enum: DogStatus })
  @IsOptional()
  @IsEnum(DogStatus)
  status?: DogStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return undefined;
  })
  @IsBoolean()
  isPublished?: boolean;

  @ApiPropertyOptional({
    description: 'When true, omit ARCHIVED dogs (unless status=ARCHIVED)',
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return undefined;
  })
  @IsBoolean()
  excludeArchived?: boolean;

  @ApiPropertyOptional({ description: 'Filter by slug substring (case-insensitive)' })
  @IsOptional()
  @IsString()
  search?: string;
}
