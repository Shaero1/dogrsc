import { Module } from '@nestjs/common';
import { DogsModule } from '../dogs/dogs.module';
import { StatsPublicController } from './stats-public.controller';
import { StatsService } from './stats.service';

@Module({
  imports: [DogsModule],
  controllers: [StatsPublicController],
  providers: [StatsService],
})
export class StatsModule {}
