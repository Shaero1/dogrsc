import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ReportPublicListItemDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty()
  description!: string;

  @ApiProperty()
  createdAt!: string;

  @ApiPropertyOptional()
  thumbnailUrl?: string | null;

  @ApiProperty()
  hasLocation!: boolean;

  @ApiProperty()
  verified!: boolean;
}

export class PaginatedReportsPublicResponseDto {
  @ApiProperty({ type: [ReportPublicListItemDto] })
  items!: ReportPublicListItemDto[];

  @ApiProperty()
  total!: number;

  @ApiProperty()
  page!: number;

  @ApiProperty()
  limit!: number;
}

export class ReportPublicDetailDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty()
  reporterName!: string;

  @ApiProperty()
  reporterPhone!: string;

  @ApiPropertyOptional()
  reporterEmail?: string | null;

  @ApiProperty()
  description!: string;

  @ApiPropertyOptional()
  latitude?: string | null;

  @ApiPropertyOptional()
  longitude?: string | null;

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  verified!: boolean;

  @ApiProperty({ type: 'array', items: { type: 'object' } })
  media!: { id: string; url: string; mimeType: string }[];
}
