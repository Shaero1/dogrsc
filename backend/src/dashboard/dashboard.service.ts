import { Injectable } from '@nestjs/common';
import {
  DogStatus,
  DonationStatus,
  ReportStatus,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { DashboardStatsDto } from './dto/dashboard-stats.dto';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getStats(): Promise<DashboardStatsDto> {
    const monthStart = this.getUtcMonthStart();

    const [
      dogsUnderCare,
      foundActive,
      lostActive,
      donationsAggregate,
      dogsAvailable,
    ] = await Promise.all([
      this.prisma.dog.count({ where: { status: DogStatus.IN_CARE } }),
      this.prisma.foundReport.count({
        where: { status: { in: [ReportStatus.ACTIVE, ReportStatus.VERIFIED] } },
      }),
      this.prisma.lostReport.count({
        where: { status: { in: [ReportStatus.ACTIVE, ReportStatus.VERIFIED] } },
      }),
      this.prisma.donation.aggregate({
        where: {
          status: DonationStatus.CONFIRMED,
          createdAt: { gte: monthStart },
        },
        _sum: { amount: true },
      }),
      this.prisma.dog.count({ where: { status: DogStatus.AVAILABLE } }),
    ]);

    const donationsSum = donationsAggregate._sum.amount;
    const donationsThisMonth = donationsSum
      ? Number(donationsSum.toString())
      : 0;

    return {
      dogsUnderCare,
      reportsActive: foundActive + lostActive,
      donationsThisMonth,
      dogsAvailable,
    };
  }

  private getUtcMonthStart(): Date {
    const now = new Date();
    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  }
}
