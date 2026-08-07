import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DogStatus } from '@prisma/client';

export class DogPublicMediaDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty()
  url!: string;

  @ApiProperty()
  mimeType!: string;
}

export class DogPublicResponseDto {
  @ApiProperty()
  slug!: string;

  @ApiProperty({ enum: DogStatus })
  status!: DogStatus;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  description!: string;

  @ApiPropertyOptional()
  rescueStory?: string;

  @ApiPropertyOptional()
  seoTitle?: string;

  @ApiPropertyOptional()
  seoDescription?: string;

  @ApiProperty({ type: [DogPublicMediaDto] })
  media!: DogPublicMediaDto[];

  @ApiProperty()
  locale!: string;
}

export class PaginatedDogsPublicResponseDto {
  @ApiProperty({ type: [DogPublicResponseDto] })
  items!: DogPublicResponseDto[];

  @ApiProperty()
  total!: number;

  @ApiProperty()
  page!: number;

  @ApiProperty()
  limit!: number;
}
