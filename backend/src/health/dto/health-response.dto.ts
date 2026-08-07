import { ApiProperty } from '@nestjs/swagger';

export class HealthResponseDto {
  @ApiProperty({ example: 'ok', description: 'ok or degraded when DB unavailable' })
  status!: string;

  @ApiProperty({ example: 'ok', description: 'ok or error' })
  database!: string;

  @ApiProperty({ example: '2026-07-31T12:00:00.000Z' })
  timestamp!: string;

  @ApiProperty({ example: '0.0.1' })
  version!: string;
}
