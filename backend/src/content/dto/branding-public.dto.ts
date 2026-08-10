import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class BrandingImageDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty()
  url!: string;

  @ApiProperty()
  mimeType!: string;
}

export class BrandingPublicDto {
  @ApiPropertyOptional({ type: BrandingImageDto, nullable: true })
  logo!: BrandingImageDto | null;

  @ApiPropertyOptional({ type: BrandingImageDto, nullable: true })
  heroImage!: BrandingImageDto | null;
}

export class BrandingAdminDto extends BrandingPublicDto {
  @ApiProperty({ type: [BrandingImageDto] })
  heroMedia!: BrandingImageDto[];

  @ApiProperty({ type: [BrandingImageDto] })
  logoMedia!: BrandingImageDto[];
}
