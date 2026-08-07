import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ReportStatus } from '@prisma/client';
import { MediaResponseDto } from '../../media/dto/media-response.dto';

export class ReportResponseDto {
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

  @ApiProperty({ enum: ReportStatus })
  status!: ReportStatus;

  @ApiProperty({ type: [MediaResponseDto] })
  media!: MediaResponseDto[];

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  updatedAt!: string;
}

export class ReportListItemDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty()
  reporterName!: string;

  @ApiProperty()
  reporterPhone!: string;

  @ApiProperty()
  description!: string;

  @ApiProperty({ enum: ReportStatus })
  status!: ReportStatus;

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  hasLocation!: boolean;

  @ApiProperty()
  verified!: boolean;
}

export class PaginatedReportsResponseDto {
  @ApiProperty({ type: [ReportListItemDto] })
  items!: ReportListItemDto[];

  @ApiProperty()
  total!: number;

  @ApiProperty()
  page!: number;

  @ApiProperty()
  limit!: number;
}
