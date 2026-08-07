import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DogStatus } from '@prisma/client';
import { MediaResponseDto } from '../../media/dto/media-response.dto';

export class DogAdminResponseDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty()
  slug!: string;

  @ApiProperty({ enum: DogStatus })
  status!: DogStatus;

  @ApiProperty()
  isPublished!: boolean;

  @ApiProperty()
  descriptions!: Record<string, unknown>;

  @ApiProperty()
  seo!: Record<string, unknown>;

  @ApiProperty({ type: [MediaResponseDto] })
  media!: MediaResponseDto[];

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  updatedAt!: string;
}

export class DogListItemDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty()
  slug!: string;

  @ApiProperty({ enum: DogStatus })
  status!: DogStatus;

  @ApiProperty()
  isPublished!: boolean;

  @ApiPropertyOptional()
  nameEn?: string;

  @ApiProperty()
  updatedAt!: string;
}

export class PaginatedDogsAdminResponseDto {
  @ApiProperty({ type: [DogListItemDto] })
  items!: DogListItemDto[];

  @ApiProperty()
  total!: number;

  @ApiProperty()
  page!: number;

  @ApiProperty()
  limit!: number;
}
