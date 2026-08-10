import { Injectable } from '@nestjs/common';
import { MediaResponseDto } from '../media/dto/media-response.dto';
import { MediaService } from '../media/media.service';
import {
  HOME_PAGE_ENTITY_ID,
  PAGE_MEDIA_ENTITY_TYPE,
  SITE_LOGO_ENTITY_ID,
  SITE_MEDIA_ENTITY_TYPE,
} from './branding.constants';
import {
  BrandingAdminDto,
  BrandingImageDto,
  BrandingPublicDto,
} from './dto/branding-public.dto';

@Injectable()
export class BrandingService {
  constructor(private readonly mediaService: MediaService) {}

  async getPublicBranding(): Promise<BrandingPublicDto> {
    const [logo, heroImage] = await Promise.all([
      this.getLatestImage(SITE_MEDIA_ENTITY_TYPE, SITE_LOGO_ENTITY_ID),
      this.getLatestImage(PAGE_MEDIA_ENTITY_TYPE, HOME_PAGE_ENTITY_ID),
    ]);

    return { logo, heroImage };
  }

  async getAdminBranding(): Promise<BrandingAdminDto> {
    const [logoMedia, heroMedia] = await Promise.all([
      this.mediaService.findByEntity(SITE_MEDIA_ENTITY_TYPE, SITE_LOGO_ENTITY_ID),
      this.mediaService.findByEntity(PAGE_MEDIA_ENTITY_TYPE, HOME_PAGE_ENTITY_ID),
    ]);

    const logo = this.toLatestImage(logoMedia);
    const heroImage = this.toLatestImage(heroMedia);

    return {
      logo,
      heroImage,
      logoMedia: logoMedia.map((item) => this.toImage(item)),
      heroMedia: heroMedia.map((item) => this.toImage(item)),
    };
  }

  private async getLatestImage(
    entityType: string,
    entityId: string,
  ): Promise<BrandingImageDto | null> {
    const items = await this.mediaService.findByEntity(entityType, entityId);
    const latest = this.toLatestImage(items);
    return latest;
  }

  private toLatestImage(items: MediaResponseDto[]): BrandingImageDto | null {
    if (items.length === 0) {
      return null;
    }

    const latest = items.reduce((acc, item) =>
      item.createdAt > acc.createdAt ? item : acc,
    );

    return this.toImage(latest);
  }

  private toImage(item: MediaResponseDto): BrandingImageDto {
    return {
      id: item.id,
      url: item.url,
      mimeType: item.mimeType,
    };
  }
}
