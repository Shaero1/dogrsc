import { ApiProperty } from '@nestjs/swagger';

export class HomeStatsDto {
  @ApiProperty({
    description:
      'All dogs ever rescued in the program (AVAILABLE + IN_CARE + ADOPTED, excludes ARCHIVED)',
    example: 2,
  })
  dogsTotal!: number;
}
