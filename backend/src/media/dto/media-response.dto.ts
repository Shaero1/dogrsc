import { ApiProperty } from '@nestjs/swagger';

export class MediaResponseDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ example: 'image/png' })
  mimeType!: string;

  @ApiProperty({ example: 1024 })
  sizeBytes!: number;

  @ApiProperty({
    description: 'Presigned GET URL (expires per MEDIA_PRESIGNED_TTL_SECONDS)',
  })
  url!: string;

  @ApiProperty({ example: '2026-08-02T00:00:00.000Z' })
  createdAt!: string;
}
