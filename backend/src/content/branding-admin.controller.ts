import { Controller, Get } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { Roles } from '../auth/roles.decorator';
import { BrandingService } from './branding.service';
import { BrandingAdminDto } from './dto/branding-public.dto';

@ApiTags('admin-content')
@Controller('admin/content/branding')
@Roles(UserRole.ADMIN)
@ApiBearerAuth()
export class BrandingAdminController {
  constructor(private readonly brandingService: BrandingService) {}

  @Get()
  @ApiOperation({ summary: 'Site logo and home hero media for admin UI' })
  @ApiOkResponse({ type: BrandingAdminDto })
  getBranding(): Promise<BrandingAdminDto> {
    return this.brandingService.getAdminBranding();
  }
}
