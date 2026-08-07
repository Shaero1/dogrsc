import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional } from 'class-validator';

export class MapMarkersQueryDto {
  @ApiPropertyOptional({ enum: ['found', 'lost', 'all'], default: 'all' })
  @IsOptional()
  @IsIn(['found', 'lost', 'all'])
  type?: 'found' | 'lost' | 'all' = 'all';
}
