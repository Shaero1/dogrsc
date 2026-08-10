import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../auth/public.decorator';
import { BrandingService } from './branding.service';
import { BrandingPublicDto } from './dto/branding-public.dto';

@ApiTags('content')
@Controller('content/branding')
@Public()
export class BrandingPublicController {
  constructor(private readonly brandingService: BrandingService) {}

  @Get()
  @ApiOperation({ summary: 'Site logo and home hero image URLs' })
  @ApiOkResponse({ type: BrandingPublicDto })
  getBranding(): Promise<BrandingPublicDto> {
    return this.brandingService.getPublicBranding();
  }
}
