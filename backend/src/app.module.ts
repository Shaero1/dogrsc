import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { RolesGuard } from './auth/roles.guard';
import { DashboardModule } from './dashboard/dashboard.module';
import { DogsModule } from './dogs/dogs.module';
import { DonationsModule } from './donations/donations.module';
import { HealthModule } from './health/health.module';
import { MapModule } from './map/map.module';
import { MediaModule } from './media/media.module';
import { ReportsModule } from './reports/reports.module';
import { UsersModule } from './users/users.module';
import { ContentModule } from './content/content.module';
import { StoriesModule } from './stories/stories.module';
import { StatsModule } from './stats/stats.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
    }),
    PrismaModule,
    HealthModule,
    AuthModule,
    MediaModule,
    DogsModule,
    ReportsModule,
    MapModule,
    DonationsModule,
    DashboardModule,
    UsersModule,
    ContentModule,
    StoriesModule,
    StatsModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
