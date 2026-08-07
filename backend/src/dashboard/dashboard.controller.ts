import { Controller, Get } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { Roles } from '../auth/roles.decorator';
import { DashboardService } from './dashboard.service';
import { DashboardStatsDto } from './dto/dashboard-stats.dto';

@ApiTags('admin-dashboard')
@Controller('admin/dashboard')
@Roles(UserRole.ADMIN, UserRole.STAFF)
@ApiBearerAuth()
export class DashboardAdminController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Dashboard aggregate stats' })
  @ApiOkResponse({ type: DashboardStatsDto })
  getStats(): Promise<DashboardStatsDto> {
    return this.dashboardService.getStats();
  }
}
