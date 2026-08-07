import { ApiProperty } from '@nestjs/swagger';
import { DonationStatus } from '@prisma/client';
import { IsIn } from 'class-validator';

export class UpdateDonationStatusDto {
  @ApiProperty({ enum: [DonationStatus.CONFIRMED, DonationStatus.FAILED] })
  @IsIn([DonationStatus.CONFIRMED, DonationStatus.FAILED])
  status!: DonationStatus;
}
