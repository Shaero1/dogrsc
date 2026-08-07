import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class MapMarkerDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ enum: ['found', 'lost'] })
  type!: 'found' | 'lost';

  @ApiProperty()
  description!: string;

  @ApiProperty({ example: '13.7563000' })
  latitude!: string;

  @ApiProperty({ example: '100.5018000' })
  longitude!: string;

  @ApiProperty()
  createdAt!: string;

  @ApiPropertyOptional()
  thumbnailUrl?: string | null;
}

export class MapMarkersResponseDto {
  @ApiProperty({ type: [MapMarkerDto] })
  items!: MapMarkerDto[];
}
