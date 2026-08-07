import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class StoryMediaDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  url!: string;

  @ApiProperty()
  mimeType!: string;
}

export class StoryPublicListItemDto {
  @ApiProperty()
  slug!: string;

  @ApiProperty()
  title!: string;

  @ApiProperty()
  excerpt!: string;

  @ApiProperty()
  publishedAt!: string;

  @ApiPropertyOptional({ type: StoryMediaDto })
  cover?: StoryMediaDto | null;

  @ApiPropertyOptional()
  dogSlug?: string | null;

  @ApiProperty()
  locale!: string;
}

export class PaginatedStoriesPublicResponseDto {
  @ApiProperty({ type: [StoryPublicListItemDto] })
  items!: StoryPublicListItemDto[];

  @ApiProperty()
  total!: number;

  @ApiProperty()
  page!: number;

  @ApiProperty()
  limit!: number;
}

export class StoryPublicDetailDto extends StoryPublicListItemDto {
  @ApiProperty()
  body!: string;
}

export class StoryAdminResponseDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty()
  slug!: string;

  @ApiProperty()
  isPublished!: boolean;

  @ApiPropertyOptional()
  publishedAt?: string | null;

  @ApiPropertyOptional({ format: 'uuid' })
  dogId?: string | null;

  @ApiPropertyOptional()
  dogSlug?: string | null;

  @ApiProperty()
  content!: Record<string, unknown>;

  @ApiProperty({ type: [StoryMediaDto] })
  media!: StoryMediaDto[];

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  updatedAt!: string;
}

export class StoryAdminListItemDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty()
  slug!: string;

  @ApiProperty()
  title!: string;

  @ApiProperty()
  isPublished!: boolean;

  @ApiPropertyOptional()
  publishedAt?: string | null;

  @ApiProperty()
  updatedAt!: string;
}

export class PaginatedStoriesAdminResponseDto {
  @ApiProperty({ type: [StoryAdminListItemDto] })
  items!: StoryAdminListItemDto[];

  @ApiProperty()
  total!: number;

  @ApiProperty()
  page!: number;

  @ApiProperty()
  limit!: number;
}
