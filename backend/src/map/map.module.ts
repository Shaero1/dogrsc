import { Module } from '@nestjs/common';
import { MediaModule } from '../media/media.module';
import { MapPublicController } from './map.controller';
import { MapService } from './map.service';

@Module({
  imports: [MediaModule],
  controllers: [MapPublicController],
  providers: [MapService],
})
export class MapModule {}
