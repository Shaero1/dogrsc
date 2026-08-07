import { Injectable } from '@nestjs/common';
import { DogsService } from '../dogs/dogs.service';
import { HomeStatsDto } from './dto/home-stats.dto';

@Injectable()
export class StatsService {
  constructor(private readonly dogsService: DogsService) {}

  async getHomeStats(): Promise<HomeStatsDto> {
    const dogsTotal = await this.dogsService.countRescued();
    return { dogsTotal };
  }
}
