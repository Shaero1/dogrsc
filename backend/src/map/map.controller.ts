import { Controller, Get, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../auth/public.decorator';
import { MapMarkersResponseDto } from './dto/map-marker.dto';
import { MapMarkersQueryDto } from './dto/map-markers-query.dto';
import { MapService } from './map.service';

@ApiTags('map')
@Controller('map')
@Public()
export class MapPublicController {
  constructor(private readonly mapService: MapService) {}

  @Get('markers')
  @ApiOperation({ summary: 'List approved report markers for the public map' })
  @ApiOkResponse({ type: MapMarkersResponseDto })
  findMarkers(
    @Query() query: MapMarkersQueryDto,
  ): Promise<MapMarkersResponseDto> {
    return this.mapService.findMarkers(query);
  }
}
