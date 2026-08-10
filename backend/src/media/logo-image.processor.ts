import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import sharp from 'sharp';
import {
  DEFAULT_LOGO_MAX_HEIGHT,
  DEFAULT_LOGO_MAX_WIDTH,
  DEFAULT_LOGO_MIN_HEIGHT,
  DEFAULT_LOGO_TRIM_ENABLED,
  DEFAULT_LOGO_TRIM_THRESHOLD,
} from './logo-image.constants';

export type ProcessedLogoImage = {
  buffer: Buffer;
  mimeType: 'image/png';
  width: number;
  height: number;
};

@Injectable()
export class LogoImageProcessor {
  private readonly trimEnabled: boolean;
  private readonly trimThreshold: number;
  private readonly maxWidth: number;
  private readonly maxHeight: number;
  private readonly minHeight: number;

  constructor(config: ConfigService) {
    this.trimEnabled = config.get<boolean>(
      'LOGO_TRIM_ENABLED',
      DEFAULT_LOGO_TRIM_ENABLED,
    );
    this.trimThreshold = config.get<number>(
      'LOGO_TRIM_THRESHOLD',
      DEFAULT_LOGO_TRIM_THRESHOLD,
    );
    this.maxWidth = config.get<number>('LOGO_MAX_WIDTH', DEFAULT_LOGO_MAX_WIDTH);
    this.maxHeight = config.get<number>(
      'LOGO_MAX_HEIGHT',
      DEFAULT_LOGO_MAX_HEIGHT,
    );
    this.minHeight = config.get<number>(
      'LOGO_MIN_HEIGHT',
      DEFAULT_LOGO_MIN_HEIGHT,
    );
  }

  async process(input: Buffer): Promise<ProcessedLogoImage> {
    let pipeline = sharp(input).rotate();

    if (this.trimEnabled) {
      try {
        pipeline = pipeline.trim({ threshold: this.trimThreshold });
      } catch {
        pipeline = sharp(input).rotate();
      }
    }

    let resized = await pipeline
      .resize({
        width: this.maxWidth,
        height: this.maxHeight,
        fit: 'inside',
        withoutEnlargement: false,
      })
      .png({ compressionLevel: 9 })
      .toBuffer({ resolveWithObject: true });

    if (resized.info.height < this.minHeight) {
      resized = await sharp(resized.data)
        .resize({
          height: this.minHeight,
          fit: 'inside',
          withoutEnlargement: false,
        })
        .png({ compressionLevel: 9 })
        .toBuffer({ resolveWithObject: true });
    }

    return {
      buffer: resized.data,
      mimeType: 'image/png',
      width: resized.info.width,
      height: resized.info.height,
    };
  }
}
