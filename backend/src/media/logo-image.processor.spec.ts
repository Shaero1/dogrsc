import sharp from 'sharp';
import { LogoImageProcessor } from './logo-image.processor';
import { ConfigService } from '@nestjs/config';

function createConfig(overrides: Record<string, unknown> = {}): ConfigService {
  const values: Record<string, unknown> = {
    LOGO_TRIM_ENABLED: true,
    LOGO_TRIM_THRESHOLD: 15,
    LOGO_MAX_WIDTH: 320,
    LOGO_MAX_HEIGHT: 128,
    LOGO_MIN_HEIGHT: 64,
    ...overrides,
  };

  return {
    get: <T>(key: string, defaultValue?: T): T =>
      (values[key] as T | undefined) ?? (defaultValue as T),
  } as ConfigService;
}

describe('LogoImageProcessor', () => {
  it('trims solid borders and outputs png within max bounds', async () => {
    const padded = await sharp({
      create: {
        width: 400,
        height: 400,
        channels: 3,
        background: { r: 0, g: 0, b: 0 },
      },
    })
      .composite([
        {
          input: await sharp({
            create: {
              width: 80,
              height: 80,
              channels: 3,
              background: { r: 200, g: 100, b: 50 },
            },
          })
            .png()
            .toBuffer(),
          left: 160,
          top: 160,
        },
      ])
      .png()
      .toBuffer();

    const processor = new LogoImageProcessor(createConfig());
    const result = await processor.process(padded);

    expect(result.mimeType).toBe('image/png');
    expect(result.width).toBeLessThanOrEqual(320);
    expect(result.height).toBeLessThanOrEqual(128);
    expect(result.height).toBeGreaterThanOrEqual(64);
    expect(result.width).toBeLessThan(400);
    expect(result.height).toBeLessThan(400);
  });
});
