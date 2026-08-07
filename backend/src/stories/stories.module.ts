import { Module } from '@nestjs/common';
import { MediaModule } from '../media/media.module';
import { StoriesAdminController } from './stories-admin.controller';
import { StoriesPublicController } from './stories-public.controller';
import { StoriesService } from './stories.service';

@Module({
  imports: [MediaModule],
  controllers: [StoriesPublicController, StoriesAdminController],
  providers: [StoriesService],
})
export class StoriesModule {}
