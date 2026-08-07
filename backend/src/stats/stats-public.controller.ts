import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../auth/public.decorator';
import { HomeStatsDto } from './dto/home-stats.dto';
import { StatsService } from './stats.service';

@ApiTags('stats')
@Controller('stats')
@Public()
export class StatsPublicController {
  constructor(private readonly statsService: StatsService) {}

  @Get('home')
  @ApiOperation({
    summary: 'Home page stats (all dogs ever rescued, including adopted)',
  })
  @ApiOkResponse({ type: HomeStatsDto })
  getHomeStats(): Promise<HomeStatsDto> {
    return this.statsService.getHomeStats();
  }
}
