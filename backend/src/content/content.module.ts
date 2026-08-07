import { Module } from '@nestjs/common';
import { ContentAdminController } from './content-admin.controller';
import { ContentPublicController } from './content-public.controller';
import { ContentService } from './content.service';

@Module({
  controllers: [ContentPublicController, ContentAdminController],
  providers: [ContentService],
  exports: [ContentService],
})
export class ContentModule {}
