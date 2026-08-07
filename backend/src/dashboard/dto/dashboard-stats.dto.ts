import { ApiProperty } from '@nestjs/swagger';

export class DashboardStatsDto {
  @ApiProperty({ example: 1 })
  dogsUnderCare!: number;

  @ApiProperty({ example: 4 })
  reportsActive!: number;

  @ApiProperty({ example: 0, description: 'Sum of CONFIRMED donations this UTC month (THB)' })
  donationsThisMonth!: number;

  @ApiProperty({ example: 1 })
  dogsAvailable!: number;
}
