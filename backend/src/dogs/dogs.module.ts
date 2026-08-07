import { Module } from '@nestjs/common';
import { MediaModule } from '../media/media.module';
import { DogsAdminController } from './dogs-admin.controller';
import { DogsPublicController } from './dogs-public.controller';
import { DogsService } from './dogs.service';

@Module({
  imports: [MediaModule],
  controllers: [DogsAdminController, DogsPublicController],
  providers: [DogsService],
  exports: [DogsService],
})
export class DogsModule {}
