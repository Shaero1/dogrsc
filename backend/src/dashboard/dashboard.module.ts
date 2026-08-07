import { Module } from '@nestjs/common';
import { DashboardAdminController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

@Module({
  controllers: [DashboardAdminController],
  providers: [DashboardService],
})
export class DashboardModule {}
