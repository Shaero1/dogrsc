import { ApiProperty } from '@nestjs/swagger';
import { ReportStatus } from '@prisma/client';
import { IsIn } from 'class-validator';

export class UpdateReportStatusDto {
  @ApiProperty({ enum: [ReportStatus.ACTIVE, ReportStatus.HIDDEN, ReportStatus.VERIFIED] })
  @IsIn([ReportStatus.ACTIVE, ReportStatus.HIDDEN, ReportStatus.VERIFIED])
  status!: ReportStatus;
}
