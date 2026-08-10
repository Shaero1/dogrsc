import { Module } from '@nestjs/common';
import { MediaModule } from '../media/media.module';
import { BrandingAdminController } from './branding-admin.controller';
import { BrandingPublicController } from './branding-public.controller';
import { BrandingService } from './branding.service';
import { ContentAdminController } from './content-admin.controller';
import { ContentPublicController } from './content-public.controller';
import { ContentService } from './content.service';

@Module({
  imports: [MediaModule],
  controllers: [
    ContentPublicController,
    ContentAdminController,
    BrandingPublicController,
    BrandingAdminController,
  ],
  providers: [ContentService, BrandingService],
  exports: [ContentService, BrandingService],
})
export class ContentModule {}
